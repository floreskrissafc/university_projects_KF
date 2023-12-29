/*
  ==============================================================================

    DJAudioPlayer.h
    Created: 6 Aug 2020 8:12:07am
    Author:  Kriss Flores

  ==============================================================================
*/

#pragma once
#include "../JuceLibraryCode/JuceHeader.h"


class DJAudioPlayer :   public AudioSource,
                        public ChangeListener
{
public:
    
    /** Constructor*/
    DJAudioPlayer(AudioFormatManager& _formatManager);
    
    /** Destructor of the component*/
    ~DJAudioPlayer();
    
    /**Implement AudioSource virtual function*/
    void prepareToPlay (int samplesPerBlockExpected, double sampleRate) override;
    
    /**Implement AudioSouce virtual function*/
    void getNextAudioBlock (const AudioSourceChannelInfo& bufferToFill) override;
    
    /**Implement AudioSouce virtual function*/
    void releaseResources() override;
    
    /**Load a new file into the player component, the parameter audioURL must be of type URL and represents the address where the file is currently stored in the system*/
    void loadURL ( URL audioURL);
    
    /**Increase the volume of the song being played by a factor of "gain" */
    void setGain(double gain);
    
    /**Set the speed of the song being played by a factor of "ratio" */
    void setSpeed(double ratio);
    
    /**Set the position in seconds where the song will start playing*/
    void setPosition(double posInSecs);
    
    /**Set the position where the song will start playing by transforming a relative position "pos" into a duration in seconds and calling setPosition on that value */
    void setPositionRelative(double pos);
    
    /**Start playing the song*/
    void start();
    
    /**Pause the song in the current position*/
    void stop();
    
    /**Get the relative position of the playhead*/
    double getPositionRelative();
    
    /**Set looping state of the song, if set = true then the song will loop indefinitely*/
    void setLooping(bool set); //NEW FEATURE
    
    /**Implement ChangeListener virtual function*/
    void changeListenerCallback(ChangeBroadcaster *source) override;  //NEW FEATURE
    
    /** Set the value of finishedPlaying according to the given parameter "finished" */
    void setFinishedPlaying(bool finished); //NEW FEATURE
    
    /** Bool, set to true if the song has finished playing*/
    bool finishedPlaying; //NEW FEATURE
    
private:
    
    AudioFormatManager& formatManager;
    std::unique_ptr<AudioFormatReaderSource> readerSource;
    AudioTransportSource transportSource;
    ResamplingAudioSource resampleSource{&transportSource,false,2};
    void setPositionAfterFinishPlaying(); //NEW FEATURE
};
