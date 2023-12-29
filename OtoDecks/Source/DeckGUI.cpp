/*
  ==============================================================================

    DeckGUI.cpp
    Created: 6 Aug 2020 8:45:14pm
    Author:  Kriss Flores

  ==============================================================================
*/

#include <JuceHeader.h>
#include "DeckGUI.h"

//==============================================================================
DeckGUI::DeckGUI(DJAudioPlayer* _player,
                AudioFormatManager& formatManagerToUse,
                AudioThumbnailCache& cacheToUse)
                :player(_player),
                waveformDisplay(formatManagerToUse, cacheToUse),
                looper(_player)
{
    addAndMakeVisible(playButton);
    addAndMakeVisible(stopButton);
    addAndMakeVisible(loadButton);
    addAndMakeVisible(volSlider);
    addAndMakeVisible(speedSlider);
    addAndMakeVisible(posSlider);
    addAndMakeVisible(waveformDisplay);
    addAndMakeVisible(looper);
    //add all the necessary listeners
    playButton.addListener(this);
    stopButton.addListener(this);
    loadButton.addListener(this);
    volSlider.addListener(this);
    speedSlider.addListener(this);
    posSlider.addListener(this);
    volSlider.setRange(0.0, 1.0);
    speedSlider.setRange(0.0, 100.0);
    posSlider.setRange(0.0, 1.0);
    
    volLabel.attachToComponent(&volSlider,true);
    speedLabel.attachToComponent(&speedSlider,true);
    posLabel.attachToComponent(&posSlider,true);
    addAndMakeVisible(volLabel);
    addAndMakeVisible(speedLabel);
    addAndMakeVisible(posLabel);
    
    volLabel.setJustificationType(Justification::horizontallyCentred);
    speedLabel.setJustificationType(Justification::horizontallyCentred);
    posLabel.setJustificationType(Justification::horizontallyCentred);
    
    startTimer(200);
}

//==============================================================================
DeckGUI::~DeckGUI()
{
    stopTimer();
}

//==============================================================================
/** Set colors and borders of the component and its children */
void DeckGUI::paint (Graphics& g)
{
    g.fillAll( juce::Colour(254, 239, 229));
    g.setColour (Colours::white);
    g.drawRect (getLocalBounds(), 1);
    g.setFont (14.0f);
    playButton.setColour(juce::TextButton::buttonColourId, juce::Colour (0, 145, 110));
    stopButton.setColour(juce::TextButton::buttonColourId, juce::Colour (238, 97, 35));
    loadButton.setColour(juce::TextButton::buttonColourId, juce::Colour (255, 207, 0));
    loadButton.setColour(juce::TextButton::textColourOffId, Colours::black);
    volLabel.setColour(juce::Label::textColourId, Colours::black);
    speedLabel.setColour(juce::Label::textColourId, Colours::black);
    posLabel.setColour(juce::Label::textColourId, Colours::black);
    volSlider.setColour(juce::Slider::textBoxTextColourId, Colours::black);
    posSlider.setColour(juce::Slider::textBoxTextColourId, Colours::black);
    speedSlider.setColour(juce::Slider::textBoxTextColourId, Colours::black);
}

//==============================================================================
void DeckGUI::resized()
{
    // This method is where you should set the bounds of any child
    // components that your component contains..
    double rowH = getHeight() / 8;
    auto labelSpace = 60;
    playButton.setBounds(0, 0, getWidth()/2, rowH);
    stopButton.setBounds(getWidth()/2, 0, getWidth()/2, rowH);
    volSlider.setBounds(labelSpace, rowH * 2, getWidth() - labelSpace, rowH);
    speedSlider.setBounds(labelSpace, rowH * 3, getWidth() - labelSpace, rowH);
    posSlider.setBounds(labelSpace, rowH * 4, getWidth() - labelSpace, rowH);
    waveformDisplay.setBounds(0, rowH * 5, getWidth(), 2*rowH);
    loadButton.setBounds(0, rowH * 1, getWidth(), rowH);
    looper.setBounds(0, rowH * 7, getWidth(), getHeight() - 7*rowH);

}

//==============================================================================
/** Implement Button::Listener virtual function. Start, pause or load a song depending on the button that was clicked */
void DeckGUI::buttonClicked(Button* button)
{
    if (button == &playButton)
    {
        player->start();
    }
    else if (button == &stopButton)
    {
        player->stop();
    }
    else if (button == &loadButton)
    {
        FileChooser chooser{"Select a file..."};
        if (chooser.browseForFileToOpen())
        {
            player->loadURL(URL{chooser.getResult()});
            waveformDisplay.loadURL(URL{chooser.getResult()});
        }
    }
}

//==============================================================================
/** Implement Slider::Listener virtual function */
void DeckGUI::sliderValueChanged (Slider *slider)
{
    if (slider == &volSlider)
    {
        player->setGain(slider->getValue());
    }

    if (slider == &speedSlider)
    {
        player->setSpeed(slider->getValue());
    }

    if (slider == &posSlider)
    {
        player->setPositionRelative(slider->getValue());
    }
}

//==============================================================================
/** Implement FileDragAndDropTarget virtual function */
bool DeckGUI::isInterestedInFileDrag(const StringArray &files)
{
    std::cout << "DeckGUI::isInterestedInFileDrag" << std::endl;
    return true;
}

//==============================================================================
/** Implement FileDragAndDropTarget virtual function */
void DeckGUI::filesDropped(const StringArray &files, int x, int y){
    std::cout << "DeckGUI::filesDropped" << std::endl;
    if (files.size() == 1){
        player->loadURL(URL{File{files[0]}});
    }
}

//==============================================================================
/** Implement Timer virtual function */
void DeckGUI::timerCallback()
{
    waveformDisplay.setPositionRelative(player->getPositionRelative());
    // If the player has finished playing a song and there is no loop
    // active, then set the posSlider to 0
    if (player->finishedPlaying){
        posSlider.setValue(0);
        player->setFinishedPlaying(false);
    }
}

//==============================================================================
/**Load a song into the Deck by getting the URL of the song as argument*/
void DeckGUI::loadFile(URL songURL)
{
    //besides being able to load a song into the GUI by using the load
    //button you can use the load buttons in the PlayListComponent, this
    //function is used for that purpose.
    player->loadURL( songURL );
    waveformDisplay.loadURL( songURL );
    looper.updateSongName( songURL.getFileName().toStdString() );
    player->setLooping( looper.isLooping() );
    looper.repaint();
}
