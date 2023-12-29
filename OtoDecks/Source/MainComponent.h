/*
  ==============================================================================

    This file was auto-generated!

  ==============================================================================
*/

#pragma once

#include "../JuceLibraryCode/JuceHeader.h"
#include "DJAudioPlayer.h"
#include "DeckGUI.h"
#include "PlaylistComponent.h"


//==============================================================================
/*
    This component lives inside our window, and this is where you should put all
    your controls and content.
*/
class MainComponent   : public PlaylistComponent::Listener,
                        public AudioAppComponent
                        
                        
{
public:
    /** Constructor*/
    MainComponent();
     /** Destructor of the component*/
    ~MainComponent();

    /**Implement AudioSource virtual function*/
    void prepareToPlay (int samplesPerBlockExpected, double sampleRate) override;
    
    /**Implement AudioSouce virtual function*/
    void getNextAudioBlock (const AudioSourceChannelInfo& bufferToFill) override;
    
    /**Implement AudioSouce virtual function*/
    void releaseResources() override;

    /** Set colors and borders of the component and its children */
    void paint (Graphics& g) override;
    
    /** Set the positioning of all the children of the component within its borders */
    void resized() override;
    
    /** Implement PlaylistComponent::Listener virtual function. Loads the song located in the given URL into one of the Decks depending on the deckNumber parameter*/
    void loadButtonClicked (URL trackURL, int deckNumber) override;

private:
    //==============================================================================
    AudioFormatManager formatManager;
    AudioThumbnailCache thumbCache{100};
    DJAudioPlayer player1{formatManager};
    DJAudioPlayer player2{formatManager};
    DeckGUI deckGUI1{&player1,formatManager,thumbCache};
    DeckGUI deckGUI2{&player2,formatManager,thumbCache};
    MixerAudioSource mixerSource;
    PlaylistComponent playlistComponent{formatManager};
    String savedPlayListPath; // NEW FEATURE
    
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (MainComponent)
};
