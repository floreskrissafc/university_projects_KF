/*
  ==============================================================================

    LooperComponent.h
    Created: 4 Sep 2020 10:24:57pm
    Author:  Kriss Flores

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include "DJAudioPlayer.h"

//==============================================================================
/*
*/
class LooperComponent    :  public Component,
                            public Button::Listener
{
public:
    
    /**Constructor*/
    LooperComponent(DJAudioPlayer* _player);
    
    /**Destructor*/
    ~LooperComponent();
    
    /** Set colors and borders of the component and its children */
    void paint (Graphics&) override;
    
    /** Set the positioning of all the children of the component within its borders */
    void resized() override;
    
    /** Implement Button::Listener  virtual function*/
    void buttonClicked (Button* button ) override;
    
    /** Update the title of the song displayed in the space at the right of the LooperComponent when a new song is uploaded into the DeckGUI*/
    void updateSongName(std::string newName);
    
    /**Return TRUE if the toggle button on the left of the LooperComponent is selected, return false otherwise*/
    bool isLooping();
    

private:
    ToggleButton loopButton{"LOOP"};
    DJAudioPlayer* player;
    Label nameLabel { {}, "No song name available..." };
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (LooperComponent)
};
