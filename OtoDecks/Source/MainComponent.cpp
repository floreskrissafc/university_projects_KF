/*
  ==============================================================================

    This file was auto-generated!

  ==============================================================================
*/

#include "MainComponent.h"
#include "PlaylistComponent.h"

//==============================================================================
MainComponent::MainComponent()
{
    //create a new file to save the playlist inside the
    //directory where the application is stored
    savedPlayListPath = File::getCurrentWorkingDirectory().getFullPathName();
    savedPlayListPath += "/OtoDecks_saved_Playlist.xml";
    File playListFile{savedPlayListPath};
    Result fileCreated = playListFile.create();
    if ( fileCreated.wasOk() ){
        //if there was no problem when creating the file or updating it
        playlistComponent.loadState(playListFile);
    }
    // Some platforms require permissions to open input channels so request that here
    if (RuntimePermissions::isRequired (RuntimePermissions::recordAudio)
        && ! RuntimePermissions::isGranted (RuntimePermissions::recordAudio))
    {
        RuntimePermissions::request (RuntimePermissions::recordAudio,
                                     [&] (bool granted) { if (granted)  setAudioChannels (2, 2); });
    }  
    else
    {
        // Specify the number of input and output channels that we want to open
        setAudioChannels (0, 2);
    }
    //add all the components
    addAndMakeVisible(deckGUI1);
    addAndMakeVisible(deckGUI2);
    addAndMakeVisible(playlistComponent);
    playlistComponent.addListener(this);
    formatManager.registerBasicFormats();
    // Make sure you set the size of the component after
    // you add any child components.
    setSize (800, 600);
}

//==============================================================================
MainComponent::~MainComponent()
{
    // This shuts down the audio device and clears the audio source.
    shutdownAudio();
    //before closing the application, save the current state of the playlist
    File newState{savedPlayListPath};
    playlistComponent.saveState(newState);
}

//==============================================================================
void MainComponent::prepareToPlay (int samplesPerBlockExpected, double sampleRate)
{
    player1.prepareToPlay(samplesPerBlockExpected, sampleRate);
    player2.prepareToPlay(samplesPerBlockExpected, sampleRate);
    mixerSource.prepareToPlay(samplesPerBlockExpected, sampleRate);
    mixerSource.addInputSource(&player1, false);
    mixerSource.addInputSource(&player2, false);
}

//==============================================================================
void MainComponent::getNextAudioBlock (const AudioSourceChannelInfo& bufferToFill)
{
    mixerSource.getNextAudioBlock(bufferToFill);
}

//==============================================================================
void MainComponent::releaseResources()
{
    // This will be called when the audio device stops, or when it is being
    // restarted due to a setting change.
    // For more details, see the help for AudioProcessor::releaseResources()
    player1.releaseResources();
    player2.releaseResources();
    mixerSource.releaseResources();
}

//==============================================================================
void MainComponent::paint (Graphics& g)
{
    g.fillAll (getLookAndFeel().findColour (ResizableWindow::backgroundColourId));
}

//==============================================================================
void MainComponent::resized()
{
    auto blankSpace = 5;
    deckGUI1.setBounds(0, 0, getWidth()/2 - blankSpace, getHeight()/2 - blankSpace );
    deckGUI2.setBounds(getWidth()/2 + blankSpace, 0, getWidth()/2 - blankSpace, getHeight() / 2 - blankSpace);
    playlistComponent.setBounds(0, getHeight()/2 + blankSpace, getWidth(), getHeight() / 2 - blankSpace);
}

//==============================================================================
/** Implement PlaylistComponent::Listener virtual function. Loads the song located in the given URL into one of the Decks depending on the deckNumber parameter*/
void MainComponent::loadButtonClicked(URL trackURL, int deckNumber)
{
    //deckNumber can only have two values, 3 or 4, since these are the
    //column numbers of the load buttons in the playlistComponent
    if ( deckNumber == 3){
        deckGUI1.loadFile(trackURL);
    }
    else if ( deckNumber == 4) {
        deckGUI2.loadFile(trackURL);
    }
}



