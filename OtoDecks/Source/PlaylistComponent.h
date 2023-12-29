/*
  ==============================================================================

    PlaylistComponent.h
    Created: 25 Aug 2020 10:43:08am
    Author:  Kriss Flores

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include <vector>
#include <string>
#include <algorithm>

//==============================================================================
/*
*/
class PlaylistComponent   : public Component,
                            public TableListBoxModel,
                            public Button::Listener,
                            public TextEditor::Listener
{
public:
    /** Constructor*/
    PlaylistComponent(AudioFormatManager& _formatManager);
    /** Destructor*/
    ~PlaylistComponent();
    
    /** Set colors and borders of the component and its children */
    void paint (Graphics&) override;
    
    /** Set the positioning of all the children of the component within its borders */
    void resized() override;
    
    /** Implement TableListBoxModel  virtual function, returns the number of rows present in the table*/
    int getNumRows() override;
    
    /** Implement TableListBoxModel  virtual function*/
    void paintRowBackground( Graphics& g, int rowNumber, int width, int height, bool rowIsSelected) override;
    
    /** Implement TableListBoxModel  virtual function*/
    void paintCell(Graphics &, int rowNumber, int columnId, int width, int height, bool rowIsSelected) override;
    
    /** Implement TableListBoxModel  virtual function*/
    Component* refreshComponentForCell( int rowNumber, int columnId, bool isRowSelected, Component *existingComponentToUpdate) override;
    
    /** Implement Button::Listener  virtual function*/
    void buttonClicked(Button* button) override; //NEW FEATURE
    
    /** Implement TableListBoxModel  virtual function*/
    void cellClicked(int rowNumber, int columnId, const MouseEvent & me) override;
    
    /** Implement TextEditor::Listener  virtual function*/
    void textEditorTextChanged(TextEditor& searchBar) override; //NEW FEATURE
    
    /** Set a listener class for the PlaylistComponent*/
    class Listener {
        public:
            /** Destructor. */
            virtual ~Listener() = default;
            /** Called when the button is clicked. */
            virtual void loadButtonClicked (URL trackURL, int deckNumber) = 0;
    };
    
    /**Add a listener to this component*/
    void addListener(Listener* listener); // NEW FEATURE
    
    /**Upload a saved playlist into this component so that all the songs loaded in a previous session are available in the component when the app starts*/
    void loadState(File& pathToFile);
    
    /**Save the current contents of the playlist into a file to use it when the application starts again*/
    void saveState(File& pathToFile);

private:
    TableListBox tableComponent;
    std::vector<std::string> trackTitles;
    AudioFormatManager& formatManager;
    
    TextEditor searchBar; //NEW FEATURE
    TextButton loadFileButton{"LOAD FILE"}; //NEW FEATURE
    std::vector<URL> trackURLs; //NEW FEATURE
    std::vector<std::string> trackLengths; //NEW FEATURE
    bool existsInTrackList(std::string trackName); //NEW FEATURE
    std::string getTrackDuration(double durationInSeconds); //NEW FEATURE
    ListenerList<Listener> listeners; //NEW FEATURE
    void searchMatchingIndexes(std::string stringToMatch); //NEW FEATURE
    std::vector<unsigned int> matchedIndexes; //NEW FEATURE
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (PlaylistComponent)
};
