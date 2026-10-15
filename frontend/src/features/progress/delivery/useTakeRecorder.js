import { useCallback, useEffect, useRef, useState } from 'react'

const SAMPLE_MS = 50
export const MAX_TAKE_MS = 60_000

/** What this browser can do. Mic + MediaRecorder are required; speech recognition is a bonus. */
export function browserSupport(win = typeof window === 'undefined' ? undefined : window) {
  const mic = Boolean(win?.navigator?.mediaDevices?.getUserMedia && win?.MediaRecorder && (win?.AudioContext || win?.webkitAudioContext))
  const speech = Boolean(win?.SpeechRecognition || win?.webkitSpeechRecognition)
  return { mic, speech }
}

/** RMS loudness (0..1) of one analyser frame. */
export function rms(buffer) {
  let sum = 0
  for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i]
  return Math.sqrt(sum / Math.max(1, buffer.length))
}

/**
 * Records one take in the browser: MediaRecorder for playback, an AnalyserNode sampled
 * every 50 ms for loudness, SpeechRecognition (when available) for a live transcript.
 * Audio stays in memory as a blob URL; nothing is uploaded.
 *
 * stop() resolves to { samples, transcript, durationMs, audioUrl }.
 */
export function useTakeRecorder() {
  const support = browserSupport()
  const [status, setStatus] = useState('idle') // idle | requesting | recording | processing | denied | error
  const [samples, setSamples] = useState([])
  const [transcript, setTranscript] = useState('')
  const [elapsedMs, setElapsedMs] = useState(0)
  const rec = useRef(null)

  const teardown = useCallback(() => {
    const r = rec.current
    if (!r) return
    clearInterval(r.timer)
    clearTimeout(r.autoStop)
    try {
      r.recognition?.abort()
    } catch {
      /* already stopped */
    }
    r.stream?.getTracks().forEach((t) => t.stop())
    r.ctx?.close().catch(() => {})
    rec.current = null
  }, [])

  useEffect(() => teardown, [teardown])

  const stop = useCallback(async () => {
    const r = rec.current
    if (!r || r.stopping) return null
    r.stopping = true
    setStatus('processing')
    clearInterval(r.timer)
    clearTimeout(r.autoStop)
    const durationMs = Math.round(performance.now() - r.t0)

    const audio = new Promise((resolve) => {
      r.recorder.onstop = () => resolve(new Blob(r.chunks, { type: r.recorder.mimeType || 'audio/webm' }))
      if (r.recorder.state === 'inactive') resolve(new Blob(r.chunks))
      else r.recorder.stop()
    })
    // Give the recogniser a moment to deliver its final result.
    const speechDone = r.recognition
      ? new Promise((resolve) => {
          r.recognition.onend = resolve
          setTimeout(resolve, 1200)
          try {
            r.recognition.stop()
          } catch {
            resolve()
          }
        })
      : Promise.resolve()

    const [blob] = await Promise.all([audio, speechDone])
    const take = {
      samples: r.samples,
      transcript: [...r.finals, r.interim].join(' ').replace(/\s+/g, ' ').trim(),
      durationMs,
      audioUrl: URL.createObjectURL(blob),
    }
    teardown()
    setStatus('idle')
    return take
  }, [teardown])

  const start = useCallback(async () => {
    if (!support.mic || rec.current) return
    setStatus('requesting')
    setSamples([])
    setTranscript('')
    setElapsedMs(0)
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
    } catch (e) {
      setStatus(e?.name === 'NotAllowedError' ? 'denied' : 'error')
      return
    }
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    ctx.createMediaStreamSource(stream).connect(analyser)
    const buf = new Float32Array(analyser.fftSize)

    const recorder = new MediaRecorder(stream)
    const r = { stream, ctx, analyser, recorder, chunks: [], samples: [], finals: [], interim: '', t0: performance.now() }
    recorder.ondataavailable = (e) => e.data.size && r.chunks.push(e.data)
    recorder.start()

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR) {
      const recognition = new SR()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = navigator.language || 'en-US'
      recognition.onresult = (ev) => {
        let interim = ''
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const res = ev.results[i]
          if (res.isFinal) r.finals.push(res[0].transcript)
          else interim += res[0].transcript
        }
        r.interim = interim
        setTranscript([...r.finals, interim].join(' ').trim())
      }
      recognition.onerror = () => {} // no-speech / network: the take still has timing metrics
      try {
        recognition.start()
        r.recognition = recognition
      } catch {
        /* unsupported in this context */
      }
    }

    r.timer = setInterval(() => {
      analyser.getFloatTimeDomainData(buf)
      const t = Math.round(performance.now() - r.t0)
      r.samples.push({ t, level: rms(buf) })
      setSamples(r.samples.slice())
      setElapsedMs(t)
    }, SAMPLE_MS)
    r.autoStop = setTimeout(() => rec.current === r && stop(), MAX_TAKE_MS)

    rec.current = r
    setStatus('recording')
  }, [support.mic, stop])

  return { support, status, samples, transcript, elapsedMs, start, stop }
}
