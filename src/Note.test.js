import Note, { quarter } from './Note';
import './js/ArrayProtos';

describe('note defaults', () => {
    it('to quarter note', () => {
      expect(new Note('F3').duration).toEqual(quarter);
    });
});

describe('whole note increment/decrement', () => {
  it('bumps up', () => {
    const note = new Note("C4");
    note.increment();
    expect(note.name()).toEqual("D4");
  });

  it('increments octave when necessary', () => {
    const note = new Note("B4");
    note.increment();
    expect(note.name()).toEqual("C5");
  });

  it('bumps down a half note', () => {
    const note = new Note("D4");
    note.decrement();
    expect(note.name()).toEqual("C4");
  });

  it('decrements octave when necessary', () => {
    const note = new Note("C4");
    note.decrement();
    expect(note.name()).toEqual("B3");
  });

  it('ignores attempts to go below octave 1', () => {
    const note = new Note("C1");
    note.decrement();
    expect(note.name()).toEqual("C1");
  });

  it('ignores attempts to go above octave 8', () => {
    const note = new Note("C8");
    note.increment();
    expect(note.name()).toEqual("C8");
  });
})

describe('hit testing', () => {
  it('is false when click does not hit', () => {
    const note = new Note("D4");
    const position = 0;

    const isHit = note.isHit({ x: note.x(position) + 1000, y: note.y() }, position);

    expect(isHit).toBeFalsy();
  });

  it('is true when click is a hit', () => {
    const note = new Note("D4");
    const position = 0;

    const isHit = note.isHit({ x: note.x(position), y: note.y() }, position);

    expect(isHit).toBeTruthy();
  });
});
