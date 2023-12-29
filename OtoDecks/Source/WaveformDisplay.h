/*
  ==============================================================================

    WaveformDisplay.h
    Created: 12 Aug 2020 8:41:49am
    Author:  Kriss Flores

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>

//==============================================================================
/*
*/
class WaveformDisplay    :  public Component,
                            public ChangeListener
{
public:
    /** Constructor*/
    WaveformDisplay(AudioFormatManager& formatManagerToUse,
                    AudioThumbnailCache& cacheToUse);
    /** Destructor*/
    ~WaveformDisplay();
    
    /** Set colors and borders of the component and its children */
    void paint (Graphics&) override;
    
    /** Set the positioning of all the children of the component within its borders */
    void resized() override;
    
    /**Implement ChangeListener virtual function*/
    void changeListenerCallback (ChangeBroadcaster *source) override;
    
    /** Set the source of the Waveform Display with the given URL*/
    void loadURL(URL audioURL);
    
    /** Set the relative position of the playhead*/
    void setPositionRelative(double pos);

private:
    AudioThumbnail audioThumb;
    bool fileLoaded;
    double position;
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (WaveformDisplay)
};
