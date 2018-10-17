import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as keyHandler from './KeyHandler'
import { addFlat, addSharp, updateTrack } from './actions'
import { hasBassNotes, hasTrebleNotes, isInFlatsMode, isInSharpsMode, barsAndNotes, trackData } from './reducers/SongReducer'
import { nearestNote } from './reducers/UIReducer'
import * as UI from './util/UI'
import * as Draw from './util/Draw'

const highlightColor = 'red' // move to ui constants source
const bassClefSymbol = '\uD834\uDD22'
const trebleClefSymbol = '\uD834\uDD1E'
const sharpSymbol = '\u266F'

export class Staff extends Component {
  componentDidMount() {
    this.addKeyListeners()
    this.addMouseListener()
    this.draw()
  }

  componentDidUpdate() {
    this.draw()
  }

  render() {
    return (
      <div>
        <canvas ref='canvas' id={this.props.id}
          tabIndex={this.props.id}
          border='0' width={this.staffWidth()} 
          height={this.staffHeight()}
          style={{marginLeft: 10, marginRight: 10, marginTop: 20}} />
      </div>
    )  // note: tabIndex needed for key events
  }

  // TODO test
  staffHeight() {
    // what if 0 notes? not possible now
    let height = 0
    // if (hasTrebleNotes(this.props.song, this.props.id))
      height += Draw.staffHeight
    if (hasBassNotes(this.props.song, this.props.id))
      height += Draw.staffHeight
    return height
  }

  staffWidth() {
    // TODO also add in width of accidentals
    const lastNotePosition = Draw.accidentalsLeft + this.props.barsAndNotes[this.props.barsAndNotes.length - 1].position
    return Draw.x(2 + lastNotePosition)
  }

  canvas() {
    return this.refs.canvas
  }

  staffContext() {
    return this.canvas().getContext('2d')
  }

  addMouseListener() {
    this.canvas().addEventListener('mousedown', this.click.bind(this))
  }

  addKeyListeners() {
    this.canvas().addEventListener('keyup', this.handleKeyPress.bind(this))
  }

  handleKeyPress(e) {
    if (keyHandler.handleKey(e, this.props.trackData.notes))
      this.props.updateTrack(this.props.id)
  }

  // TODO nearest note is screwed

  // TODO test
  click(e) {
    const clickPoint = UI.mousePosition(this.canvas(), e)
    if (this.props.isInSharpsMode) {
      if (this.isClickInAccidentals(clickPoint)) {
        console.log(clickPoint)
        console.log('nearest note: ', this.props.nearestNote(clickPoint))
        this.props.addSharp(this.props.id, this.props.nearestNote(clickPoint))
      }
    } 
    else if (this.props.isInFlatsMode) {
      if (this.isClickInAccidentals(clickPoint))
        this.props.addFlat(this.props.id, this.props.nearestNote(clickPoint))
    }
    else if (this.props.trackData.notes.clickHitNote(clickPoint)) 
        this.props.updateTrack(this.props.id)
  }

  // TODO the click is based on the note sequence... however,
  // the ties are only part of the bar sequence... so clickHitNote should be
  // called in interaction w/ the barSequence()
  // Maybe BarSequence becomes the first-class type

  // TODO test
  // TODO move to query on props
  isClickInAccidentals(point) {
    const r = this.props.ui.staff.accidentalsRect.contains(point)
    console.log('in accidentals area')
    return r
  }

  draw() {
    this.staffContext().clearRect(0, 0, this.canvas().width, this.canvas().height)
    this.props.barsAndNotes.forEach(x => x.drawOn(
      this.staffContext(),
      hasTrebleNotes(this.props.song, this.props.id),
      hasBassNotes(this.props.song, this.props.id)))
    this.drawStaffLines()
  }

  drawStaff(lines) {
    this.staffContext().beginPath()
    lines.forEach(line => {
      const currentY = Draw.y(line)
      Draw.drawLine(this.staffContext(), 0, currentY, this.staffWidth(), currentY)
    })
    this.staffContext().stroke()
    this.drawAccidentalsArea()
  }

  drawClefSign(symbol, y, px) {
    this.staffContext().beginPath()
    this.staffContext().fillStyle = 'black'
    this.staffContext().font = `${px}px Arial`
    this.staffContext().fillText(symbol, 10, y)
    this.staffContext().stroke()
  }

  drawStaffLines() {
    // TODO: treble staff could be optional if the calcs for noteY
    //  when there's only a bass staff are adjusted
    // if (hasTrebleNotes(this.props.song, this.props.id)) { ... }
    this.drawStaff(Draw.trebleStaffLines)
    this.drawClefSign(trebleClefSymbol, Draw.y('F4'), Draw.staffHeight / 2)

    if (hasBassNotes(this.props.song, this.props.id)) {
      this.drawStaff(Draw.bassStaffLines)
      this.drawClefSign(bassClefSymbol, Draw.y('A2'), Draw.staffHeight / 3)
    }
  }

  drawSharp(note, sharpIndex) {
    console.log('sharp for', note)
    const x = Draw.accidentalsLeft + (sharpIndex % Draw.sharpsInWidth) * Draw.sharpArea + Draw.sharpWidth
    const y = Draw.y(note) + 4

    const px = Draw.lineHeight
    this.staffContext().beginPath()
    this.staffContext().fillStyle = 'black'
    this.staffContext().font = `${px}px Arial`
    this.staffContext().fillText(sharpSymbol, x, y)
    this.staffContext().stroke()

    /*
    this.staffContext().beginPath()

    const y = Draw.y(note) + 4
    // yuk. Draw.accidentalsLeft => draw into a rectangle first
    const x = Draw.accidentalsLeft + (sharpIndex % Draw.sharpsInWidth) * Draw.sharpArea + Draw.sharpWidth

    let top = y - (Draw.sharpHeight / 2)
    let bottom = y + (Draw.sharpHeight / 2)
    let upstrokeLeft = x - (Draw.staffWidthBetweenUpstrokes / 2)
    let upstrokeRight = x + (Draw.staffWidthBetweenUpstrokes / 2)

    let verticalOffset = Draw.sharpHeight / 3

    let weight = 2
    Draw.drawLine(this.staffContext(), upstrokeLeft, top, upstrokeLeft, bottom, weight)
    Draw.drawLine(this.staffContext(), upstrokeRight, top - verticalOffset, upstrokeRight, bottom - verticalOffset, weight)

    this.staffContext().stroke()

    this.staffContext().beginPath()
    weight = 4
    let left = x - (Draw.sharpWidth / 2)
    let right = x + (Draw.sharpWidth / 2)
    let upslashYstart = y - (Draw.sharpHeight / 4)
    let upslashYend = upslashYstart - verticalOffset
    Draw.drawLine(this.staffContext(), left, upslashYstart, right, upslashYend, weight)

    upslashYstart = y + (Draw.sharpHeight / 4)
    upslashYend = upslashYstart - verticalOffset
    Draw.drawLine(this.staffContext(), left, upslashYstart, right, upslashYend, weight)
    this.staffContext().stroke()
    */
  }

  drawFlat(note, sharpIndex) {
    const height = 36
    const width = 12

    const y = Draw.y(note) - (height * 4 / 5)
    const x = Draw.accidentalsLeft + (sharpIndex % Draw.sharpsInWidth) * Draw.sharpArea + Draw.sharpWidth
    
    this.staffContext().beginPath()
    this.staffContext().lineWidth = 3
    this.staffContext().strokeStyle = 'black'
    
    this.staffContext().moveTo(x, y)
    this.staffContext().lineTo(x, y + height)

    this.staffContext().stroke()

    this.staffContext().beginPath()
    const startX = x
    const startY = y + (height * 2 / 3)

    const cp1x = x + width
    const cp1y = startY - (height * 3 / 10)

    const endX = x
    const endY = y + height

    const cp2x = x + (width * 2 / 3)
    const cp2y = endY - (height * 1 / 10)

    this.staffContext().moveTo(cp2x, cp2y)
    this.staffContext().lineWidth = 5
    this.staffContext().moveTo(startX, startY)
    this.staffContext().bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY)
    this.staffContext().stroke()
  }

  drawAccidentalsArea() {
    if (this.props.isInSharpsMode || this.props.isInFlatsMode) {
      this.staffContext().beginPath()
      const lineWidth = 6
      this.props.ui.staff.accidentalsRect.drawOn(this.staffContext(), highlightColor, lineWidth)
      this.staffContext().stroke()
    }

    if (this.props.trackData.sharps)
      this.props.trackData.sharps.forEach((note, i) => {
        this.drawSharp(note, i)
      })

    if (this.props.trackData.flats) {
      const drawOffset = this.props.trackData.sharps 
        ? this.props.trackData.sharps.length
        : 0
      this.props.trackData.flats.forEach((note, i) => {
        this.drawFlat(note, i + drawOffset)
      })
    }
  }
}

const mapStateToProps = ({ ui, composition }, ownProps) => {
  const song = composition.song
  const trackId = ownProps.id
  const dataForTrack = trackData(composition, trackId)
  return { 
    trackData: dataForTrack,
    isInSharpsMode: isInSharpsMode(song, trackId),
    isInFlatsMode: isInFlatsMode(song, trackId),
    nearestNote: point => nearestNote(ui, point),
    barsAndNotes: barsAndNotes(song, dataForTrack),
    ui, 
    song }
}

const mapDispatchToProps = { addSharp, addFlat, updateTrack }

export default connect(mapStateToProps, mapDispatchToProps)(Staff)