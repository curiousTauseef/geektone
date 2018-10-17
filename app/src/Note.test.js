import Note from './Note'
import * as Duration from './Duration'
import Tie from './Tie'
import { restRectangleTop } from './ui/NoteWidget'

describe('note', () => {
  describe('a note', () => {
    it('defaults to quarter note', () => {
      expect(new Note('F3').duration).toEqual(Duration.quarter)
    })

    it('answers number of sixteenths', () => {
      expect(new Note('F3', Duration.quarter).sixteenths()).toEqual(4)
      expect(new Note('F3', '4n.').sixteenths()).toEqual(6)
    })

    it('answers number of dot sixteeths for dotted notes', () => {
      expect(new Note('F3', '4n.').sixteenthsInTheDot()).toEqual(2)
      expect(new Note('F3', '8n.').sixteenthsInTheDot()).toEqual(1)
    })

    describe('is higher or equal to', () => {
      it('returns true when note in same octave and higher', () => {
        expect(new Note('F3').isHigherOrEqual(new Note('E3'))).toBeTruthy()
      })

      it('returns false when note in same octave and not higher', () => {
        expect(new Note('F3').isHigherOrEqual(new Note('G3'))).toBeFalsy()
      })

      it('returns true when note in higher octave', () => {
        expect(new Note('F4').isHigherOrEqual(new Note('G3'))).toBeTruthy()
      })

      it('returns false when note in lower octave', () => {
        expect(new Note('F3').isHigherOrEqual(new Note('E4'))).toBeFalsy()
      })
    })
  })

  describe('whole note increment/decrement', () => {
    it('bumps up', () => {
      const note = new Note('C4')
      note.increment()
      expect(note.name()).toEqual('D4')
    })

    it('increments octave when necessary', () => {
      const note = new Note('B4')
      note.increment()
      expect(note.name()).toEqual('C5')
    })

    it('decrements octave when necessary', () => {
      const note = new Note('C4')
      note.decrement()
      expect(note.name()).toEqual('B3')
    })

    it('ignores attempts to go below lowest note', () => {
      const note = new Note('E2')
      note.decrement()
      expect(note.name()).toEqual('E2')
    })

    it('ignores attempts to go above highest note', () => {
      const note = new Note('A5')
      note.increment()
      expect(note.name()).toEqual('A5')
    })
  })

  describe('to JSON', () => {
    it('converts a basic note', () => {
      expect(new Note('F3', '8n').toJSON()).toEqual({name: 'F3', duration: '8n', isNote: true})
    })

    it('includes whether or not it is a rest', () => {
      const note = new Note('F3', '4#n')
      note.restToggle()

      const json = note.toJSON()

      expect(json).toEqual({name: 'F3', duration: '4#n', isNote: false})
    })
  })

  describe('dotted notes', () => {
    describe('property', () => {
      it('is false when not dotted', () => {
        expect(new Note('F2', '4n').isDotted()).toBeFalsy()
      })

      it('is true when dotted', () => {
        expect(new Note('F2', '4n.').isDotted()).toBeTruthy()
      })
    })

    describe('toggle', () => {
      it('toggles dot to non dotted note', () => {
        const note = new Note('F2', '4n')

        note.toggleDot()

        expect(note.duration).toEqual('4n.')
      })

      it('removes dot from dotted note', () => {
        const note = new Note('F2', '2n.')

        note.toggleDot()

        expect(note.duration).toEqual('2n')
      })

      it('does not toggle whole notes', () => {
        const note = new Note('G4', '1n')

        note.toggleDot()

        expect(note.duration).toEqual('1n')
      })

      it('does not toggle 16th notes', () => {
        const note = new Note('G4', '16n')

        note.toggleDot()

        expect(note.duration).toEqual('16n')
      })
    })
  })

  describe('hit testing', () => {
    it('is false when click does not hit', () => {
      const note = new Note('D4')
      note.setPosition(0)

      const isHit = note.isHit({ x: note.x() + 1000, y: note.y() })

      expect(isHit).toBeFalsy()
    })

    it('is true when click is a hit', () => {
      const note = new Note('D4')
      note.setPosition(0)

      const isHit = note.isHit({ x: note.x(), y: note.y() })

      expect(isHit).toBeTruthy()
    })

    it('is true when a tie is hit', () => {
      const tieStart = new Tie('D4')
      tieStart.setPosition(0)
      const tieEnd = new Tie('D4')
      tieEnd.setPosition(1)
      const note = new Note('D4', Duration.half)
      note.setTies([tieStart], [tieEnd])
      note.setPosition(0)

      const isHit = note.isHit({ x: tieEnd.x(), y: note.y() })

      expect(isHit).toBeTruthy()
    })

    it('is true when rest and click in highlight rectangle', () => {
      const note = new Note('C4')
      note.setPosition(0)
      note.restToggle()

      const isHit = note.isHit({ x: note.x(), y: restRectangleTop + 1 })

      expect(isHit).toBeTruthy()
    })

    it('is false when rest and click outside highlight rectangle', () => {
      const note = new Note('C4')
      note.setPosition(0)
      note.restToggle()

      const isHit = note.isHit({ x: note.x(), y: restRectangleTop - 1 })

      expect(isHit).toBeFalsy()
    })
  })

  describe('ties', () => {
    let note
    beforeEach(() => {
      note = new Note('G4', Duration.half)
      note.setTies([new Note('G4', Duration.quarter)],
                   [new Note('G4', Duration.quarter)])
    })

    it('is tie when first (from) Tie exists', () => {
      expect(note.isRepresentedAsTie()).toBeTruthy()
    })

    it('is not a tie when cleared', () => {
      note.clearTie()

      expect(note.isRepresentedAsTie()).toBeFalsy()
    })

    it('increments the tie value', () => {
      note.increment()

      expect(note.name()).toEqual('A4')
      expect(note.startTies.every(t => t.name() === 'A4')).toBeTruthy()
      expect(note.endTies.every(t => t.name() === 'A4')).toBeTruthy()
    })

    it('decrements the tie value', () => {
      note.decrement()

      expect(note.name()).toEqual('F4')
      expect(note.startTies.every(t => t.name() === 'F4')).toBeTruthy()
      expect(note.endTies.every(t => t.name() === 'F4')).toBeTruthy()
    })
  })

  describe('rest', () => {
    it('is not rest by default', () => {
      const note = new Note('D5')

      expect(note.isRest()).toBeFalsy()
    })

    it('converts note to rest on toggle', () => {
      const note = new Note('D5')

      note.restToggle()

      expect(note.isRest()).toBeTruthy()
    })

    it('can be created via factory method', () => {
      const rest = Note.Rest(Duration.half)

      expect(rest.isRest()).toBeTruthy()
      expect(rest.duration).toEqual(Duration.half)
    })

    it('defaults to quarter rest by default', () => {
      const rest = Note.Rest()

      expect(rest.duration).toEqual(Duration.quarter)
    })

    it('converts from rest to note on toggle', () => {
      const rest = Note.Rest()

      rest.restToggle()

      expect(rest.isRest()).toBeFalsy()
    })
  })

  describe('select / deselect', () => {
    it('also selects any ties', () => {
      const note = new Note('E4', Duration.half)
      note.setTies([new Tie('E4'), new Tie('F5')], [new Tie('E4')])

      note.select()
      
      expect(note.isSelected).toBeTruthy()
      expect(note.startTies.every(t => t.isSelected)).toBeTruthy()
      expect(note.endTies.every(t => t.isSelected)).toBeTruthy()
    })
    
    it('also deselects any ties', () => {
      const note = new Note('E4', Duration.half)
      note.setTies([new Tie('E4')], [new Tie('E4')])
      note.select()

      note.deselect()
      
      expect(note.isSelected).toBeFalsy()
      expect(note.startTies.every(t => t.isSelected)).toBeFalsy()
      expect(note.endTies.every(t => t.isSelected)).toBeFalsy()
    })
  })
})