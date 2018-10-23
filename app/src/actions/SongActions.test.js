import configureMockStore from 'redux-mock-store'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as actions from './SongActions'
import * as type from './types'

describe('async actions', () => {
  let mock
  let dispatch
  const song = { name: 'x' }

  beforeEach(() => {
    mock = new MockAdapter(axios)
    dispatch = jest.fn()
  })

  afterEach(() => {
    mock.restore()
  })

  describe('load song list', () => {
    it('dispatches to SONG_LIST on successful retrieve', async () => {
      mock.onGet(actions.request('/songs')).reply(200, [['1', 'songname']])

      await actions.loadSongList()(dispatch)

      expect(dispatch).toHaveBeenCalledWith(actions.songList([['1', 'songname']]))
    })

    it('dispatches to error message on failed retrieve', async () => {
      mock.onGet(actions.request('/songs')).reply(500)

      await actions.loadSongList()(dispatch)

      expect(dispatch).toHaveBeenCalledWith(actions.errorMessage('unable to retrieve song list: Error: Request failed with status code 500'))
    })
  })

  describe('delete song', () => {
    it('dispatches to new song if no id', async () => {
      await actions.deleteSong({ name: 'abc' })(dispatch)

      expect(dispatch).toHaveBeenCalledWith(actions.newSong())
    })

    it('dispatches to delete song name with song list', async () => {
      mock.onDelete(actions.request('/song/42')).reply(200, [['42', 'newName']])

      await actions.deleteSong({ name: 'abc', id: '42' })(dispatch)

      expect(dispatch).toHaveBeenCalledWith(actions.removeSong([['42', 'newName']]))
    })

    it('dispatches to error message on failed retrieve', async () => {
      mock.onDelete(actions.request('/song/42')).reply(500)

      await actions.deleteSong({ name: 'abc', id: '42' })(dispatch)

      expect(dispatch).toHaveBeenCalledWith(actions.errorMessage('unable to delete song: Error: Request failed with status code 500'))
    })
  })

  describe('put song name', () => {
    it('calls change new song name if new (not persisted)', async () => {
      await actions.putSongName(undefined, 'a new name')(dispatch)

      expect(dispatch).toHaveBeenCalledWith(actions.changeNewSongName('a new name'))
    })

    it('dispatches to change song name on success', async () => {
      mock.onPut(actions.request('/song/42/rename')).reply(200, [['42', 'newName']])

      await actions.putSongName('42', 'newName')(dispatch)

      expect(dispatch).toHaveBeenCalledWith(actions.changeSongName('newName', [['42', 'newName']]))
    })

    it('trims song name sent up', async () => {
      mock.onPut(actions.request('/song/42/rename')).reply(200, [['42', 'newName']])

      await actions.putSongName('42', '   newName   ')(dispatch)

      expect(dispatch).toHaveBeenCalledWith(actions.changeSongName('newName', [['42', 'newName']]))
    })

    it('dispatches to error message on failed retrieve', async () => {
      mock.onPut(actions.request('/song/42/rename')).reply(500)

      await actions.putSongName('42', 'newName')(dispatch)

      expect(dispatch).toHaveBeenCalledWith(actions.errorMessage('unable to rename song: Error: Request failed with status code 500'))
    })
  })

  describe('load song', () => {
    it('dispatches to replace song on successful retrieve', async () => {
      const song = { name: 'x', id: '86' }
      mock.onGet(actions.request('/song/86')).reply(200, song)

      await actions.loadSong('86')(dispatch)
      
      expect(dispatch).toHaveBeenCalledWith(actions.replaceSong(song))
    })

    it('dispatches to error message', async () => {
      mock.onGet(actions.request('/song/86')).reply(500)

      await actions.loadSong('86')(dispatch)
      
      expect(dispatch).toHaveBeenCalledWith(actions.errorMessage('unable to load song; Error: Request failed with status code 500'))
    })
  })

  describe('save song', () => {
    it('dispatches to create song when no id exists', async () => {
      song.id = undefined
      mock.onPost(actions.request('/song')).reply(201, { id: '42', songList: [['42', 'new song']] })

      await actions.saveSong(song)(dispatch)
      
      expect(dispatch).toHaveBeenCalledWith({ type: type.CREATE_SONG, payload: { id: '42', songList: [['42', 'new song']], message: 'song created' } })
    })

    it('dispatches to mark clean when song is being updated', async () => {
      song.id = '42'
      mock.onPut(actions.request('/song/42')).reply(200)

      await actions.saveSong(song)(dispatch)
      
      expect(dispatch).toHaveBeenCalledWith({ type: type.MARK_CLEAN, payload: 'song saved' })
    })

    it('dispatches to error message', async () => {
      song.id = undefined
      mock.onPost(actions.request('/song')).reply(500)

      await actions.saveSong(song)(dispatch)
      
      expect(dispatch).toHaveBeenCalledWith({ type: type.ERROR, payload: 'unable to create your song, sorry: Error: Request failed with status code 500' })
    })
  })
})
