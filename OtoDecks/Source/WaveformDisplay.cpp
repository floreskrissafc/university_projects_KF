/*
  ==============================================================================

    WaveformDisplay.cpp
    Created: 12 Aug 2020 8:41:49am
    Author:  Kriss Flores

  ==============================================================================
*/

#include <JuceHeader.h>
#include "WaveformDisplay.h"

//==============================================================================
WaveformDisplay::WaveformDisplay(AudioFormatManager& formatManagerToUse,
                                    AudioThumbnailCache& cacheToUse)
            : audioThumb(1000,formatManagerToUse,cacheToUse),
              fileLoaded(false),
                position(0)
{
    // In your constructor, you should add any child components, and
    // initialize any special settings that your component needs.
    audioThumb.addChangeListener(this);
}
//==============================================================================
WaveformDisplay::~WaveformDisplay()
{
}
//==============================================================================
/** Set colors and borders of the component and its children */
void WaveformDisplay::paint (Graphics& g)
{
    g.fillAll (getLookAndFeel().findColour (ResizableWindow::backgroundColourId));   // clear the background
    g.setColour (Colours::white);
    g.drawRect (getLocalBounds(), 1);   // draw an outline around the component
    g.setColour (Colours::orange);
    if (fileLoaded) {
        audioThumb.drawChannel(g, getLocalBounds(), 0, audioThumb.getTotalLength(), 0, 1.0f);
        g.setColour(Colours::lightgreen);
        g.fillRect( position*getWidth(), 0 , getWidth() / 100, getHeight() );
    } else {
        g.setFont (20.0f);
        g.drawText ("File not loaded yet...", getLocalBounds(),
                    Justification::centred, true);
    }
}

//==============================================================================
void WaveformDisplay::resized()
{
    // This method is where you should set the bounds of any child
    // components that your component contains..
}

//==============================================================================
/**Implement ChangeListener virtual function*/
void WaveformDisplay::changeListenerCallback (ChangeBroadcaster *source)
{
    // When a change is detected, you must repaint the wave
    repaint();
}

//==============================================================================
/** Set the source of the Waveform Display with the given URL*/
void WaveformDisplay::loadURL(URL audioURL)
{
    audioThumb.clear();
    fileLoaded = audioThumb.setSource(new URLInputSource(audioURL));
    if (fileLoaded) {
        std::cout << "wfd: loaded" << std::endl;
    }else {
        std::cout << "wfd: not loaded" << std::endl;
    }
}

//==============================================================================
/** Set the relative position of the playhead*/
void WaveformDisplay::setPositionRelative(double pos)
{
    if ( pos != position){
        position = pos; //store for later use
        repaint();
    }
}
