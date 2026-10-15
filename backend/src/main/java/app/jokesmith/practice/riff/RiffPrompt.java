package app.jokesmith.practice.riff;

import java.util.List;

/** A curated daily setup line plus model punchlines revealed after the user has riffed. */
public record RiffPrompt(int index, String setup, List<String> modelPunchlines) {}
