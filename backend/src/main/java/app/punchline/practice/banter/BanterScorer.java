package app.punchline.practice.banter;

import app.punchline.practice.Words;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Rule-based banter coach. Scores a reply 1-5 on wit, surprise and kindness from cues a
 * human coach would notice: did you answer in time, did you just agree, did you twist,
 * exaggerate, call back to their words or play a character, and was it kind.
 */
public final class BanterScorer {
  private BanterScorer() {}

  /** Grace on top of the countdown for network and the final keystroke. */
  static final int GRACE_MS = 1_500;

  public record Score(int wit, int surprise, int kindness, boolean timedOut, BanterTechnique spotted, String tip) {
    public int total() {
      return wit + surprise + kindness;
    }
  }

  private static final Pattern AGREE = Pattern.compile(
      "^(yeah|yes|yep|yup|same|lol|lmao|ha+|haha\\w*|true|me too|i know|omg|nice|cool|congrats|congratulations|agreed|"
          + "totally|ugh|right|ikr|sounds good|that'?s (great|nice|cool|awesome|so true)|oh no|aw+|wow|ok|okay|fair|"
          + "good for you|love that|so true|for real|same here)\\b.*");
  private static final Pattern EXAGGERATE = Pattern.compile(
      "\\b(\\d+|million|billion|thousand|hundred|forever|entire|whole|every|never|always|literally|centur(y|ies)|"
          + "lifetime|planet|universe|galaxy|ever|years|decade|apocalypse|biblical|nuclear|olympic)\\b|\\w{4,}est\\b");
  private static final Pattern TWIST = Pattern.compile(
      "\\b(but|except|unless|actually|plot twist|turns out|apparently|instead|meanwhile|which is why|"
          + "so that'?s why|wait|technically|well,|or as i call it)\\b");
  private static final Pattern REVERSE = Pattern.compile(
      "\\b(i love|honestly i|i'?m jealous|lucky|the real (problem|question|victim)|opposite|rather than|i miss)\\b");
  private static final Pattern ROLE = Pattern.compile("^\\*|\\*[^*]+\\*|\\bvoice\\b|^\"|\\bas (a|an|the) \\w+[,:]");
  private static final Pattern SELF = Pattern.compile("\\b(i'?m|i|my|me|myself)\\b.*\\b(bad|worse|worst|terrible|"
      + "awful|can'?t|couldn'?t|failed|lazy|useless|tragic|nap|couch|sofa|single|broke|panic|cried|amateur)\\b");
  private static final Pattern MEAN = Pattern.compile(
      "\\b(stupid|idiot|ugly|fat|loser|dumb|pathetic|shut up|hate you|moron|disgusting|loser|kill yourself|"
          + "nobody cares|who cares|boring|lame|cringe|gross)\\b");
  private static final Pattern WARM = Pattern.compile(
      "\\b(love|proud|congrats|amazing|lucky|brave|good for you|happy for|honou?r|hero|legend|iconic|support)\\b");

  public static Score score(String line, String reply, long responseMs, int secondsLimit) {
    String r = reply == null ? "" : reply.strip();
    if (r.isEmpty()) {
      return new Score(1, 1, 3, true, null,
          "Silence is the one reply that never lands. Next time type the first half-thought you have; a quick okay line beats a perfect late one.");
    }
    boolean late = responseMs > secondsLimit * 1000L + GRACE_MS;
    String low = r.toLowerCase(Locale.ROOT);
    int words = low.split("\\s+").length;

    boolean agree = AGREE.matcher(low).matches() && words <= 5;
    boolean exaggerate = EXAGGERATE.matcher(low).find();
    boolean twist = TWIST.matcher(low).find();
    boolean reverse = REVERSE.matcher(low).find();
    boolean role = ROLE.matcher(r).find();
    boolean self = SELF.matcher(low).find();
    boolean mean = MEAN.matcher(low).find();
    boolean warm = WARM.matcher(low).find();
    boolean callback = sharesWord(line, r);
    boolean specific = r.matches(".*\\d.*") || r.matches(".*\\s[A-Z][a-z]+.*");
    boolean question = r.endsWith("?");

    int cues = (exaggerate ? 1 : 0) + (twist ? 1 : 0) + (reverse ? 1 : 0) + (role ? 1 : 0) + (self ? 1 : 0);
    int wit = 2 + Math.min(2, cues) + (callback ? 1 : 0);
    if (agree) wit = Math.min(wit, 2) - 1;
    if (words <= 2 && !agree) wit = Math.min(wit, 2);
    if (words > 30) wit--;
    if (late) wit--;

    int surprise = 2 + (exaggerate ? 1 : 0) + (twist || reverse ? 1 : 0) + (specific || role ? 1 : 0);
    if (agree) surprise = 1;
    if (question && cues == 0) surprise = Math.max(surprise, 2);

    int kindness = 4 + (self || warm ? 1 : 0);
    if (mean) kindness = warm ? 3 : 2;
    if (mean && low.matches(".*\\b(you|you'?re|your)\\b.*")) kindness = 1;

    BanterTechnique spotted = role ? BanterTechnique.ROLE_PLAY
        : reverse ? BanterTechnique.REVERSAL
        : self ? BanterTechnique.SELF_DEPRECATION
        : exaggerate ? BanterTechnique.EXAGGERATION
        : twist ? BanterTechnique.MISDIRECTION
        : callback && !agree ? BanterTechnique.CALLBACK
        : null;

    Score draft = new Score(clamp(wit), clamp(surprise), clamp(kindness), late, spotted, "");
    return new Score(draft.wit(), draft.surprise(), draft.kindness(), late, spotted,
        tip(draft, agree, words, late, mean, callback));
  }

  private static String tip(Score s, boolean agree, int words, boolean late, boolean mean, boolean callback) {
    if (late) return "Good instinct, but the moment had passed. In real banter the first decent line wins: trust it and hit Enter.";
    if (mean) return "That one has teeth. Banter works when the target laughs too: aim the joke at the situation or at yourself.";
    if (agree) return "You agreed, which is polite but flat. Agree, then add a twist: blow one detail up, or flip it (\"Mondays? I love them, it's the other six days\").";
    if (words <= 2) return "Short is good, but give it one image. A single specific detail turns a reaction into a joke.";
    if (words > 30) return "Banter is a jab, not a speech. Cut to the last surprising bit and lead with that.";
    if (s.surprise() <= 2) return "It's a fine reply, just the one anyone would say. Ask \"what's the opposite?\" or \"what if it were a thousand times worse?\"";
    if (!callback) return "Nice. Next level: reuse one of their exact words in your reply. Callbacks show you're listening and get a bigger laugh.";
    if (s.wit() >= 4 && s.surprise() >= 4) return "That's the stuff. Now do it again, faster: lower the countdown and see if the instinct holds.";
    return "Solid. Try stacking two moves: exaggerate, then twist at the end, so the funniest word lands last.";
  }

  private static boolean sharesWord(String line, String reply) {
    List<String> a = Words.content(line);
    for (String w : Words.content(reply)) if (w.length() >= 4 && a.contains(w)) return true;
    return false;
  }

  private static int clamp(int v) {
    return Math.max(1, Math.min(5, v));
  }

  /** Crowd reaction for a total score of 3-15. */
  public static String verdict(int total) {
    if (total <= 6) return "Crickets";
    if (total <= 8) return "Polite chuckle";
    if (total <= 10) return "Got a laugh";
    if (total <= 12) return "Big laugh";
    return "Applause break";
  }
}
