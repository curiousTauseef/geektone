import * as Duration from './Duration'

export const noteBase = noteName => noteName.substring(0, 1)

export const octave = noteName => noteName.substring(noteName.length - 1)

const withAccidental = (noteName, accidental) => 
  `${noteBase(noteName)}${accidental}${octave(noteName)}`

export const applyAccidentals = (note, sharps = [], flats = []) => {
  const noteName = note.name()

  if (note.accidental === '#' || note.accidental === 'b')
    return withAccidental(noteName, note.accidental)
  if (note.accidental === 'n')
    return withAccidental(noteName, '')

  if (sharps.map(noteBase).includes(noteBase(noteName)))
    return withAccidental(noteName, '#')
  if (flats.map(noteBase).includes(noteBase(noteName)))
    return withAccidental(noteName, 'b')
  return noteName
}

export const noteObjects = (notes, sharps = [], flats = []) => {
  const result = []
  let startSixteenths = 0
  notes.forEach(note => {
    if (!note.isRest()) {
      const startTime = Duration.transportTime(startSixteenths)
      const noteName = applyAccidentals(note, sharps, flats)
      result.push({ name: noteName, duration: note.duration, time: startTime /* , context: note.context, x: note.x(), y: note.y() */ })
    }
    startSixteenths += Duration.toSixteenths(note.duration)
  });
  return result
}