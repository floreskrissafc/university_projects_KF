/*
  ==============================================================================

    LooperComponent.cpp
    Created: 4 Sep 2020 10:24:57pm
    Author:  Kriss Flores

  ==============================================================================
*/

#include <JuceHeader.h>
#include "LooperComponent.h"

//==============================================================================
LooperComponent::LooperComponent(DJAudioPlayer* _player):player(_player)
{
    // In your constructor, you should add any child components, and
    // initialize any special settings that your component needs.
    addAndMakeVisible( loopButton );
    addAndMakeVisible( nameLabel );
    loopButton.addListener( this );
}

//==============================================================================
LooperComponent::~LooperComponent()
{
}

//==============================================================================
/** Set colors and borders of the component and its children */
void LooperComponent::paint ( Graphics& g )
{
    g.fillAll ( juce::Colours::white );
    g.setFont ( 14.0f );
    nameLabel.setJustificationType( Justification::horizontallyCentred );
    nameLabel.setColour( juce::Label::backgroundColourId, juce::Colour(254, 239, 229) );
    nameLabel.setColour( juce::Label::textColourId, Colours::black );
    loopButton.setColour( juce::ToggleButton::tickColourId, Colours::red );
    loopButton.setColour( juce::ToggleButton::textColourId, Colours::black );
    loopButton.setColour( juce::ToggleButton::tickDisabledColourId, Colours::black );
    // draw rectangles of random colors to cover
    // the whole background of the component
    auto areaToDraw = getLocalBounds().toFloat();
    float heightRect = areaToDraw.getHeight() / 6.0f; //height of each small rectangle
    int numberOfRects = areaToDraw.getWidth() / heightRect;
    
    for (int i{0}; i <= numberOfRects ; ++i) {
        auto smallRectArea = areaToDraw.withHeight( heightRect ).withWidth( heightRect );
        smallRectArea.translate( i * heightRect, 0);
        for (int j{0}; j < 6 ; ++j) {
            int red = rand() % 256;
            int green = rand() % 256;
            int blue = rand() % 256;
            g.setColour( juce::Colour( red, green, blue) );
            g.fillRect( smallRectArea );
            smallRectArea.translate(0, heightRect);
        }
    }
    
    float toggleAreaHeight = areaToDraw.getHeight() - 2 * heightRect;
    float toggleAreaWidth = areaToDraw.getWidth() / 4;
    auto toggleArea = areaToDraw.withHeight( toggleAreaHeight ).withWidth( toggleAreaWidth );
    toggleArea.translate( 2 * heightRect, heightRect);
    g.setColour( juce::Colour(254, 239, 229) );
    g.fillRoundedRectangle( toggleArea, 5.0f );
}

//==============================================================================
/** Set the positioning of all the children of the component within its borders */
void LooperComponent::resized()
{
    // This method is where you should set the bounds of any child
    // components that your component contains..
    double compHeight = getHeight() / 1.5;
    loopButton.setBounds( 4 * getHeight() / 6, getHeight() / 6, getWidth() / 5, compHeight);
    nameLabel.setBounds( getWidth() / 3, getHeight() / 6,  2 * getWidth() / 3   -  getHeight() / 3 , compHeight);

}

//==============================================================================
/** Implement Button::Listener  virtual function. There is only one button inside this component, is the loopButton, when it is clicked then the looping state of the song must be set to true*/
void LooperComponent::buttonClicked (Button* button )
{
    if ( button == &loopButton ) {
        bool isActive { loopButton.getToggleState() == 1 };
        player->setLooping( isActive );
    }
}

//==============================================================================
/** Update the title of the song displayed in the space at the right of the LooperComponent when a new song is uploaded into the DeckGUI*/
void LooperComponent::updateSongName(std::string newName)
{
    nameLabel.setText(newName, NotificationType::dontSendNotification);
}

/**Return TRUE if the toggle button on the left of the LooperComponent is selected, return false otherwise*/
bool LooperComponent::isLooping()
{
    return loopButton.getToggleState() == 1;
}


