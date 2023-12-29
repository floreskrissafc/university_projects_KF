/*
  ==============================================================================

    DJAudioPlayer.cpp
    Created: 6 Aug 2020 8:12:07am
    Author:  Kriss Flores

  ==============================================================================
*/

#include "DJAudioPlayer.h"

DJAudioPlayer::DJAudioPlayer(AudioFormatManager& _formatManager):formatManager(_formatManager)
{
    transportSource.addChangeListener(this);
    finishedPlaying = false;
}

//==============================================================================
DJAudioPlayer::~DJAudioPlayer(){
    
}

//==============================================================================
/**Implement AudioSource virtual function*/
void DJAudioPlayer::prepareToPlay (int samplesPerBlockExpected, double sampleRate)
{
    transportSource.prepareToPlay(samplesPerBlockExpected, sampleRate);
    resampleSource.prepareToPlay(samplesPerBlockExpected, sampleRate);
}

//==============================================================================
/**Implement AudioSouce virtual function*/
void DJAudioPlayer::getNextAudioBlock (const AudioSourceChannelInfo& bufferToFill)
{
    if ( readerSource.get() == nullptr)
    {
        bufferToFill.clearActiveBufferRegion();
        return;
    }
    resampleSource.getNextAudioBlock (bufferToFill);
}

//==============================================================================
/**Implement AudioSouce virtual function*/
void DJAudioPlayer::releaseResources() {
    resampleSource.releaseResources();
}

//==============================================================================
/**Load a new file into the player component, the parameter audioURL must be of type URL and represents the address where the file is currently stored in the system*/
void DJAudioPlayer::loadURL( URL audioURL){
    auto* reader = formatManager.createReaderFor(audioURL.createInputStream(false));
        if (reader != nullptr) // good file!
        {
            std::unique_ptr<AudioFormatReaderSource> newSource (new AudioFormatReaderSource (reader,true));
            transportSource.setSource (newSource.get(), 0, nullptr, reader->sampleRate);
            readerSource.reset (newSource.release());
        }
    setFinishedPlaying(true);
}

//==============================================================================
/**Increase the volume of the song being played by a factor of "gain" */
void DJAudioPlayer::setGain(double gain){
    if ( gain < 0 || gain > 1){
        std::cout << "DJAudioPlayer::setGain gain should be between 0 and 1" << std::endl;
    } else {
        transportSource.setGain(gain);
    }
}

//==============================================================================
/**Set the speed of the song being played by a factor of "ratio" */
void DJAudioPlayer::setSpeed(double ratio){
    if ( ratio <= 0 || ratio > 100.0){
        std::cout << "DJAudioPlayer::setSpeed ratio should be between 0 and 100" << std::endl;
    }else {
        resampleSource.setResamplingRatio(ratio);
    }
}

//==============================================================================
/**Set the position in seconds where the song will start playing*/
void DJAudioPlayer::setPosition(double posInSecs){
    transportSource.setPosition(posInSecs);
}

//==============================================================================
/**Set the position where the song will start playing by transforming a relative position "pos" into a duration in seconds and calling setPosition on that value */
void DJAudioPlayer::setPositionRelative(double pos)
{
    if ( pos < 0 || pos > 1){
        std::cout << "DJAudioPlayer::setPositionRelative pos should be between 0 and 1" << std::endl;
    }
    else {
        double posInSec = transportSource.getLengthInSeconds()*pos;
        setPosition(posInSec);
    }
}

//==============================================================================
/**Start playing the song*/
void DJAudioPlayer::start(){
    transportSource.start();
    finishedPlaying = false;
}

//==============================================================================
 /**Pause the song in the current position*/
void DJAudioPlayer::stop(){
    transportSource.stop();
}

//==============================================================================
/**Get the relative position of the playhead*/
double DJAudioPlayer::getPositionRelative()
{
    if (transportSource.getLengthInSeconds() != 0){
        //to avoid division by zero if no file is yet loaded
        return transportSource.getCurrentPosition() / transportSource.getLengthInSeconds();
    }
    return 0;
}

//==============================================================================
/**Set looping state of the song, if set = true then the song will loop indefinitely*/
void DJAudioPlayer::setLooping(bool loop)
{
    if ( readerSource != nullptr ){ // to prevent the program from throwing an error if you have not yet uploaded a song into the deck
        readerSource->setLooping(loop);
    }
}

//==============================================================================
/** If the song has finished playing and there is no looping active, reset the position of the transportSource*/
void DJAudioPlayer::changeListenerCallback(ChangeBroadcaster *source)
{
    if (source == &transportSource)
    {
        if (transportSource.hasStreamFinished() && !readerSource->isLooping() ){
            setPositionAfterFinishPlaying();
        }
    }
}

//==============================================================================
void DJAudioPlayer::setFinishedPlaying(bool finished)
{
    finishedPlaying = finished;
}

//==============================================================================

/**When the player finishes playing a song, set the finishedPlaying state to true*/
void DJAudioPlayer::setPositionAfterFinishPlaying()
{
    transportSource.setPosition(0);
    transportSource.stop();
    setFinishedPlaying(true);
}


