/*
  ==============================================================================

    PlaylistComponent.cpp
    Created: 25 Aug 2020 10:43:08am
    Author:  Kriss Flores

  ==============================================================================
*/

#include <JuceHeader.h>
#include "PlaylistComponent.h"
#include <algorithm>
#include <string>

//==============================================================================
PlaylistComponent::PlaylistComponent(AudioFormatManager& _formatManager):formatManager(_formatManager)
{
    // In your constructor, you should add any child components, and
    // initialize any special settings that your component needs.
    searchBar.setTextToShowWhenEmpty("  Search for a song...", Colours::black);
    searchBar.setIndents(8, 8);
    addAndMakeVisible(searchBar);
    addAndMakeVisible(loadFileButton);
    searchBar.addListener(this);
    loadFileButton.addListener(this);
    loadFileButton.setComponentID("loadButton");
    tableComponent.getHeader().addColumn("Track title", 1, 300);
    tableComponent.getHeader().addColumn("Duration", 2, 100);
    tableComponent.getHeader().addColumn("Load Deck (left)", 3, 200);
    tableComponent.getHeader().addColumn("Load Deck (right)", 4, 200);
    tableComponent.getHeader().setStretchToFitActive(true);
    tableComponent.setModel(this);
    addAndMakeVisible(tableComponent);
}

//==============================================================================
PlaylistComponent::~PlaylistComponent()
{
}

//==============================================================================
/** Set colors and borders of the component and its children */
void PlaylistComponent::paint (Graphics& g)
{
    g.fillAll( getLookAndFeel().findColour( ResizableWindow::backgroundColourId ) );
    //set colors for search bar and load button
    searchBar.setColour( juce::TextEditor::backgroundColourId, Colours::antiquewhite );
    searchBar.setColour( juce::TextEditor::textColourId, Colours::black);
    loadFileButton.setColour( juce::TextButton::buttonColourId, juce::Colour (249, 200, 70));
    loadFileButton.setColour( juce::TextButton::textColourOffId, Colours::black);
    //if there is any row in the table, set the colors of its buttons
    for (int i {0}; i < matchedIndexes.size(); ++i) {
        for (int k {3}; k < 5; ++k){
            Component* currButton = tableComponent.getCellComponent(k,i);
            if ( k == 3) {
                currButton->setColour(juce::TextButton::buttonColourId, juce::Colour (52, 89, 149));
            } else {
                currButton->setColour(juce::TextButton::buttonColourId, juce::Colour (3, 206, 164));
            }
        }
    }
}
//==============================================================================
/** Set the positioning of all the children of the component within its borders */
void PlaylistComponent::resized()
{
    // This method is where you should set the bounds of any child
    // components that your component contains..
    double rowH = getHeight() / 8;
    double rowWidth = getWidth() / 3;
    searchBar.setBounds(0, 0, rowWidth * 2, rowH);
    loadFileButton.setBounds(rowWidth * 2, 0, rowWidth, rowH);
    tableComponent.setBounds(0, rowH, getWidth(), getHeight() - rowH);
}

//==============================================================================
/** Implement TableListBoxModel  virtual function, returns the number of rows present in the table*/
int PlaylistComponent::getNumRows(){
    return static_cast<int>( matchedIndexes.size() );
};

//==============================================================================
/** Implement TableListBoxModel  virtual function*/
void PlaylistComponent::paintRowBackground( Graphics & g, int rowNumber, int width, int height, bool rowIsSelected)
{
    if (rowIsSelected){
        g.fillAll(Colours::orange);
    }
    else {
        // To make each even row to be one color and each odd
        // row of another color
        if ( rowNumber % 2 == 0 ) g.fillAll(juce::Colour(254, 239, 229));
        else g.fillAll(juce::Colour(219, 221, 219));
    }
};

//==============================================================================
/** Implement TableListBoxModel  virtual function*/
void PlaylistComponent::paintCell(Graphics & g, int rowNumber, int columnId, int width, int height, bool rowIsSelected)
{
    if (columnId == 1){
        //draw the name of the song in the first column from the left
        g.drawText( trackTitles[ matchedIndexes[ rowNumber ] ], 2, 0, width - 4, height, Justification::centredLeft,true);
    }
    else if (columnId == 2){
        //draw the duration of the song in the second column from the left
        g.drawText( trackLengths[ matchedIndexes[ rowNumber ] ], 2, 0, width - 4, height, Justification::centredLeft,true);
    }
};

//==============================================================================
/** Implement TableListBoxModel  virtual function*/
Component* PlaylistComponent::refreshComponentForCell( int rowNumber, int columnId, bool isRowSelected, Component *existingComponentToUpdate)
{
    if ( columnId == 3 || columnId == 4){
        std::string name;
        if (columnId == 3){ name = "Load Deck1";}
        else { name = "Load Deck2";}
        std::string id_std { std::to_string( matchedIndexes[ rowNumber ] ) };
        id_std.append("-");
        id_std.append( std::to_string(columnId) );
        String id{ id_std };
        if ( existingComponentToUpdate == nullptr ){
            TextButton* btn = new TextButton{name};
            btn->addListener(this);
            existingComponentToUpdate = btn;
        }
        existingComponentToUpdate->setComponentID(id);
    }
    return existingComponentToUpdate;
}

//==============================================================================
/** Implement Button::Listener  virtual function*/
void PlaylistComponent::buttonClicked(Button* button)
{
    if ( button == &loadFileButton){
        //add a song to the playlist if a song with the same name is not already included
        FileChooser chooser{"Select a file..."};
        if (chooser.browseForFileToOpen())
        {
            File file = chooser.getResult();
            std::string fileName = file.getFileNameWithoutExtension().toStdString();
            if ( !existsInTrackList(fileName) ) {
                //the song is not yet included
                trackTitles.push_back( fileName );
                URL trackURL = URL{ file };
                trackURLs.push_back( trackURL );
                auto* reader = formatManager.createReaderFor( trackURL.createInputStream(false) );
                if (reader != nullptr) // good file!
                {
                    std::unique_ptr<AudioFormatReaderSource> newSource (new AudioFormatReaderSource (reader,
                    true));
                    AudioTransportSource transportSource;
                    transportSource.setSource (newSource.get(), 0, nullptr, reader->sampleRate);
                    double songLengthInSeconds = transportSource.getLengthInSeconds();
                    std::string songDuration = getTrackDuration(songLengthInSeconds);
                    trackLengths.push_back(songDuration);
                }
                //clear the search bar once you include the new song
                searchBar.setText("",false);
                searchMatchingIndexes("");
            }
        }
    }
    else {
        //in case one of the buttons to load a song into DECK 1 o 2 is clicked
        std::string id = button->getComponentID().toStdString();
        std::size_t found = id.find("-");
        if ( found != std::string::npos){
            //find out which of the LOAD buttons was clicked
            int col = std::stoi( id.substr( found + 1 ) );
            int row = std::stoi( id.substr( 0, found ) );
            // call the loadButtonClicked callback function on
            // all the listeners for this component
            listeners.call( [&] (PlaylistComponent::Listener& L) {L.loadButtonClicked(trackURLs[row],col);} );
        }
    }
    
}

//==============================================================================
/** Implement TableListBoxModel  virtual function*/
void PlaylistComponent::cellClicked(int rowNumber, int columnId, const MouseEvent & mouseEvent)
{
    std::cout << "YOU CLICKED ON ROW " << rowNumber << " AND ON COLUMN " << columnId << std::endl;
}

//==============================================================================
void PlaylistComponent::textEditorTextChanged(TextEditor& editor)
{
    // Whenever the text in the text editor is changed, this function is called,
    // it must then find the matching song names using searchMatchingIndexes()
    searchMatchingIndexes( editor.getText().toStdString() );
}

//==============================================================================
/**Add a listener to this component*/
void PlaylistComponent::addListener(Listener* listener)
{
    listeners.add(listener);
}

//==============================================================================
/** Loads information from a File into the trackTitles, trackURLs and trackLengths vectors so that a previous playlist can be shown */
void PlaylistComponent::loadState(File& pathToFile)
{
    FileInputStream stream{pathToFile};
    if (stream.openedOk()) {
        ValueTree tree = ValueTree::readFromStream(stream);
        Identifier trackTitlesVector("trackTitlesVector");
        Identifier trackLengthsVector("trackLengthsVector");
        Identifier trackURLsVector("trackURLsVector");
        if ( tree.hasProperty(trackTitlesVector) &&
            tree.hasProperty(trackLengthsVector) &&
            tree.hasProperty(trackURLsVector) )
        {
            Array<var>* namesArr = tree.getProperty(trackTitlesVector).getArray();
            Array<var>* durationArr = tree.getProperty(trackLengthsVector).getArray();
            Array<var>* URLArr = tree.getProperty(trackURLsVector).getArray();
            
            for (int i{0}; i < namesArr->size(); ++i) {
                String currName = (*namesArr)[i];
                String currDuration = durationArr->data()[i];
                URL currURL { URLArr->data()[i] };
                trackTitles.push_back( currName.toStdString() );
                trackLengths.push_back( currDuration.toStdString() );
                trackURLs.push_back( currURL );
            }
            searchMatchingIndexes(""); //match all the songs in the playlist
        }
    }
}

//==============================================================================
/** Saves the trackTitles, trackURLs and trackLengths vectors into a file so that the current playlist can be loaded
    when the application opens again*/
void PlaylistComponent::saveState(File& pathToFile)
{
    
    FileOutputStream stream{pathToFile};
    if (stream.openedOk()) {
        stream.setPosition(0);
        stream.truncate(); //clear the contents of the file
    }
    //create a ValueTree object with its identifier
    Identifier treeID{"treeIdentifier"};
    ValueTree tree{treeID};

    Identifier trackTitlesVector("trackTitlesVector");
    Identifier trackLengthsVector("trackLengthsVector");
    Identifier trackURLsVector("trackURLsVector");
    
    StringArray trackTitlesArray;
    StringArray trackLengthsArray;
    StringArray trackURLsArray;
    
    for (int i{0}; i < trackTitles.size(); ++i) {
        trackTitlesArray.add(trackTitles[i]);
        trackLengthsArray.add(trackLengths[i]);
        trackURLsArray.add(trackURLs[i].toString(false));
        
    }
    //add and set the properties of the tree, which are going to be
    //the vectors we want to save
    tree.setProperty(trackTitlesVector, trackTitlesArray , nullptr);
    tree.setProperty(trackLengthsVector, trackLengthsArray , nullptr);
    tree.setProperty(trackURLsVector, trackURLsArray , nullptr);
    //Write all the contents of the tree into the stream
    tree.writeToStream(stream);
}

//==============================================================================
/** Checks if a song name is already included in the playlist*/
bool PlaylistComponent::existsInTrackList(std::string trackName)
{
    std::vector<std::string>::iterator it;
    it = find (trackTitles.begin(), trackTitles.end(), trackName);
    if ( it != trackTitles.end() ) return true;
    return false;
}
//==============================================================================
/**Get the duration of a song as "hour:min:sec" string */
std::string PlaylistComponent::getTrackDuration(double durationInSeconds)
{
    int hoursAmount = durationInSeconds/3600;
    std::string hourString = std::to_string(hoursAmount);
    if (hourString.size() < 2){
        hourString.insert(0, "0");
    }
    int minutesAmount = (durationInSeconds - hoursAmount*3600)/60;
    std::string minuteString = std::to_string(minutesAmount);
    if (minuteString.size() < 2){
        minuteString.insert(0, "0");
    }
    int secondsAmount =  (durationInSeconds - hoursAmount*3600) - minutesAmount*60;
    std::string secondsString = std::to_string(secondsAmount);
    if (secondsString.size() < 2){
        secondsString.insert(0, "0");
    }
    std::string duration;
    duration.append(hourString);
    duration.append(":");
    duration.append(minuteString);
    duration.append(":");
    duration.append(secondsString);
    return duration;
}

//==============================================================================
/** Fills the matchedIndexes array with the indexes of the songs already in the playlist where
    the strToMatch can be found as a substring of the song's name */
void PlaylistComponent::searchMatchingIndexes(std::string strToMatch)
{
    matchedIndexes.clear();
    for (size_t i{0}; i < trackTitles.size(); ++i) {
        //check if stringToMatch is a substring of the current trackTitle
        size_t index = trackTitles[i].find(strToMatch);
        if ( index != std::string::npos ){
            matchedIndexes.push_back( static_cast<int>(i) );
        }
    }
    tableComponent.updateContent(); //this updates the table with the found matches
    repaint();
}


