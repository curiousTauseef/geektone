import 'rc-slider/assets/index.css'
import 'rc-tooltip/assets/bootstrap.css'
import React, { Component } from 'react'
import { Col, Button, Grid, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import Staff from './Staff'
import { changeTrackInstrument, deleteTrack, setVolume, toggleMute, toggleFlatsMode, toggleSharpsMode } from './actions'
import { trackData } from './reducers/SongReducer'
import Slider from 'rc-slider'

export class Track extends Component {
  instrumentChange(e) {
    this.props.changeTrackInstrument(e.target.value, this.props.id)
  }

  render() {
    return (
        <Grid>
          <Row>
            <Col xs={6}>
              <select value={this.props.trackData.instrument} onChange={this.instrumentChange.bind(this)}>
                <option value='bass-electric'>Bass (electric)</option>
                <option value='bassoon'>Bassoon</option>
                <option value='cello'>Cello</option>
                <option value='electric-guitar'>Electric guitar</option>
                <option value='french-horn'>French horn</option>
                <option value='organ'>Organ</option>
                <option value='piano'>Piano</option>
                <option value='trumpet'>Trumpet</option>
                <option value='violin'>Violin</option>
              </select>
              <Button className='btn-song' onClick={() => this.props.toggleSharpsMode(this.props.id)}>#</Button>
              <Button className='btn-song' onClick={() => this.props.toggleFlatsMode(this.props.id)}>{ '\u266D' }</Button>
              <Button className='btn-song' onClick={() => this.props.deleteTrack(this.props.id)}>x</Button>
              <label htmlFor='isMuted'>Mute</label>
              <input id='isMuted' type='checkbox'
                  checked={this.props.trackData.isMuted}
                  onChange={() => this.props.toggleMute(this.props.id)} />
              <Slider min={1} max={10} 
                marks={{1: '1', 5: '5', 10: '10'}}
                defaultValue={this.props.trackData.volume} 
                onAfterChange={value => this.props.setVolume(this.props.id, value)} />
            </Col>
          </Row>
          <Row>
            <Staff key={this.props.id} id={this.props.id} />
          </Row>
        </Grid>
    )
  }
}

const mapStateToProps = ({composition, ui}, ownProps) => (
  { trackData: trackData(composition, ownProps.id),
    song: composition.song, 
    ui 
  }
)

const mapDispatchToProps = { changeTrackInstrument, deleteTrack, setVolume, toggleMute, toggleFlatsMode, toggleSharpsMode }
export default connect(mapStateToProps, mapDispatchToProps)(Track)