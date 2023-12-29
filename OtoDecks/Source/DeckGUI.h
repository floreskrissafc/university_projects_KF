/*
  ==============================================================================

    DeckGUI.h
    Created: 6 Aug 2020 8:45:14pm
    Author:  Kriss Flores

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include "DJAudioPlayer.h"
#include "WaveformDisplay.h"
#include "LooperComponent.h"

//==============================================================================
/*
*/
class DeckGUI    :  public Component,
                    public Button::Listener,
                    public Slider::Listener,
                    public FileDragAndDropTarget,
                    public Timer
{
public:
    /** Constructor*/
    DeckGUI(DJAudioPlayer* player,
            AudioFormatManager& formatManagerToUse,
            AudioThumbnailCache& cacheToUse);
    /** Destructor*/
    ~DeckGUI();
    
    /** Set colors and borders of the component and its children */
    void paint (Graphics&) override;
    
    /** Set the positioning of all the children of the component within its borders */
    void resized() override;
    
    /** Implement Button::Listener virtual function */
    void buttonClicked (Button *) override;

    /** Implement Slider::Listener virtual function */
    void sliderValueChanged (Slider *slider) override;
    
    /** Implement FileDragAndDropTarget virtual function */
    bool isInterestedInFileDrag(const StringArray &files) override;
    
    /** Implement FileDragAndDropTarget virtual function */
    void filesDropped(const StringArray &files, int x, int y) override;
    
    /** Implement Timer virtual function. This allows the playhead to move in the waveform display*/
    void timerCallback() override;
    
    /**Load a song into the Deck by getting the URL of the song as argument*/
    void loadFile(URL songURL);

private:
    
    TextButton playButton{"PLAY"};
    TextButton stopButton{"PAUSE"};
    TextButton loadButton{"LOAD"};
    Slider volSlider;
    Slider speedSlider;
    Slider posSlider;
    DJAudioPlayer* player;
    WaveformDisplay waveformDisplay;
    
    LooperComponent looper; // NEW FEATURE
    Label volLabel { {}, "Volume"};  // NEW FEATURE
    Label speedLabel { {}, "Speed"}; // NEW FEATURE
    Label posLabel { {}, "Position"};// NEW FEATURE
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (DeckGUI)
};
