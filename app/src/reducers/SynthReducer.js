import { ADD_SYNTH, PLAY_SONG, STOP_SONG } from '../actions/types'
import { play, stop } from '../ToneUtils'

export const showPlayButton = synth => 
  Object.keys(synth.synths).length === synth.expectedSynthCount &&
    !synth.isPlaying

export const startNoteIndices = (song, selectionStartLine) => {
  if (!selectionStartLine.start)
    return song.tracks.map(_ => 0)

  return song.tracks.map(track => 
    track.notes.allNotes().findIndex(n => n.x() > selectionStartLine.start.x))
}

export const INITIAL_STATE = {
  synths: {},
  expectedSynthCount: 9, // TODO this is such shit
  isPlaying: false
}

export default(state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_SYNTH: {
      const instrument = action.payload.instrument
      const synth = action.payload.synth
      return { ...state, synths: {...state.synths, [instrument]: synth} }
    }

    case PLAY_SONG: {
      const { song, songCompletedCallback, selectionStartLine } = action.payload
      play(song, state.synths, songCompletedCallback, startNoteIndices(song, selectionStartLine))
      return { ...state, isPlaying: true }
    }

    case STOP_SONG: {
      stop()
      return { ...state, isPlaying: false }
    }

    default: 
      return state
  }
}