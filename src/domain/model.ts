export type MidiNote = number;

export const midiNoteToFreq = (note: MidiNote) => {
  return 440 * Math.pow(2, (note - 69) / 12);
};
