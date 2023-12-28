import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DATABASE_NAME = 'koios_2DB.db';

const dataEnglish = require('./assets/dictionaries/dictionary_English.json');

const dataSpanish = require('./assets/dictionaries/dictionary_Spanish.json');

const createCoursesTable = (tx) => {
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS Courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Course_Name TEXT(20) NOT NULL,
      Started BOOLEAN DEFAULT 0,
      Completed BOOLEAN DEFAULT 0,
      Highest_Score INTEGER CHECK (Highest_Score >= 0)
    )`,
    [],
    () => {
      // console.log('Courses table created successfully.');
    },
    (error) => {
      console.error('Error creating Courses table:', error);
    }
  );
};

const createScoresTable = (tx) => {
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS Scores (
      Course_ID INTEGER,
      Score INTEGER CHECK (Score >= 0 OR Score = 0),
      Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (Course_ID, Date),
      FOREIGN KEY (Course_ID) REFERENCES Courses (id)
    )`,
    [],
    () => {
      // console.log('Scores table created successfully');
    },
    (error) => {
      console.error('Error creating Scores table:', error);
    }
  );
};

const createCourseLevelsTable = (tx) =>{
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS Course_Levels (
      Course_ID INTEGER,
      Level_Name TEXT(2) CHECK (Level_Name IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
      Total_Words INTEGER DEFAULT 0 CHECK (Total_Words >= 0),
      Known_Words INTEGER DEFAULT 0 CHECK (Known_Words >= 0),
      PRIMARY KEY (Course_ID, Level_Name),
      FOREIGN KEY (Course_ID) REFERENCES Courses(id)
    )`,
    [],
    () => {
      // console.log('Course_Levels table created successfully');
    },
    (error) => {
      console.error('Error creating Course_Levels table:', error);
    }
  );
};

const createEnglishWordsTable = (tx) =>{
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS English_Words (
      Word TEXT(30) PRIMARY KEY NOT NULL,
      Definition TEXT(600) NOT NULL,
      Revisions INTEGER DEFAULT 0 CHECK (Revisions >= 0),
      Review_List BOOLEAN DEFAULT 0,
      Level_Name TEXT(2) REFERENCES Course_Levels(Level_Name)
    )`,
    [],
    () => {
      // console.log('English_Words table created successfully');
    },
    (error) => {
      console.error('Error creating English_Words table:', error);
    }
  );
};

const createSpanishWordsTable = (tx) =>{
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS Spanish_Words (
      Word TEXT(30) PRIMARY KEY NOT NULL,
      Definition TEXT(600) NOT NULL,
      Revisions INTEGER DEFAULT 0 CHECK (Revisions >= 0),
      Review_List BOOLEAN DEFAULT 0,
      Level_Name TEXT REFERENCES Course_Levels(Level_Name)
    )`,
    [],
    () => {
      // console.log('Spanish_Words table created successfully');
    },
    (error) => {
      console.error('Error creating Spanish_Words table:', error);
    }
  );
};

const createDatabase = () =>{
  const db = SQLite.openDatabase(DATABASE_NAME);
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        createCoursesTable(tx);
        createScoresTable(tx);
        createCourseLevelsTable(tx);
        createEnglishWordsTable(tx);
        createSpanishWordsTable(tx);
      },
      (error) => {
        reject(error);
      },
      () => {
        resolve();
        // console.log('Tables were created');
      }
    );
  });
};

const checkTablesCreated = () =>{
  const db = SQLite.openDatabase(DATABASE_NAME);
  return new Promise((resolve, reject) => {
    db.transaction((transaction) => {
      transaction.executeSql(
        `SELECT name FROM sqlite_master WHERE type='table'`,
        [],
        (transaction, result) => {
          const existingTables = [];
          for (let i = 0; i < result.rows.length; i++) {
            existingTables.push(result.rows.item(i).name);
          }

          const requiredTables = ['Courses', 'Course_Levels', 'English_Words','Spanish_Words'];
          const missingTables = requiredTables.filter(
            (table) => !existingTables.includes(table)
          );

          if (missingTables.length === 0) {
            // console.log('All required tables exist in the database.');
            resolve('All required tables exist in the database.');
          } else {
            console.error(`Missing tables: ${missingTables.join(', ')}.`);
            reject(
              `Missing tables: ${missingTables.join(', ')}.`
            );
          }
        },
        (error) => {
          console.error(`Error checking for existing tables: ${error.message}`);
          reject(`Error checking for existing tables: ${error.message}`);
        }
      );
    });
  });
};

const clearTable = (tableName, tx) => {
  tx.executeSql(
    `DELETE FROM ${tableName}`,
    [],
    (_, { rowsAffected }) => {
      // console.log(`${rowsAffected} rows deleted from ${tableName} table.`);
    },
    (_, error) => {
      console.log(`Error occurred while deleting rows from ${tableName} table:`, error);
    }
  );
};

const clearTables = () =>{
  const db = SQLite.openDatabase(DATABASE_NAME);
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tableNames = ["Courses", "Course_Levels","Scores","English_Words","Spanish_Words"];
        for (let table of tableNames){
          clearTable(table,tx);
        }
      },
      (error) => {
        reject(error);
      },
      () => {
        resolve();
        // console.log('Tables were cleaned');
      }
    );
  });
};

const dropTable = (tableName, tx) => {
  tx.executeSql(
    `DROP TABLE IF EXISTS ${tableName}`,
    [],
    () => {
      // console.log(`Table '${tableName}' dropped successfully.`);
    },
    (error) => {
      console.error(`Error dropping table '${tableName}':`, error);
    }
  );
};

const dropTables = () =>{
  const db = SQLite.openDatabase(DATABASE_NAME);
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tableNames = ["Courses", "Course_Levels","Scores","English_Words","Spanish_Words"];
        for (let table of tableNames){
          dropTable(table,tx);
        }
      },
      (error) => {
        reject(error);
      },
      () => {
        resolve();
        // console.log('Tables were dropped');
      }
    );
  });
};

const populateCoursesTable = () =>{
  const db = SQLite.openDatabase(DATABASE_NAME);
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO Courses (Course_Name) VALUES (?)`,
        ['English'],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            // Insert the second row
            tx.executeSql(
              `INSERT INTO Courses (Course_Name) VALUES (?)`,
              ['Spanish'],
              (_, { rowsAffected }) => {
                if (rowsAffected > 0) {
                  resolve();
                  // console.log("Course_Name 'Spanish was inserted in Courses table'" );
                } else {
                  reject(new Error('Failed to insert rows into Courses table.'));
                }
              },
              (_, error) => {
                console.log('Error occurred while inserting second row:', error);
                reject(error);
              }
            );
          } else {
            console.log('Failed to insert first row.');
            reject(new Error('Failed to insert rows into Courses table.'));
          }
        },
        (_, error) => {
          console.log('Error occurred while inserting first row:', error);
          reject(error);
        }
      );
    });
  });
};

const populateCourseLevelsTable = () => {
  const db = SQLite.openDatabase(DATABASE_NAME);
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Fetching the course IDs from the Courses table
      tx.executeSql(
        `SELECT id FROM Courses`,
        [],
        (_, { rows }) => {
          const courseIDs = rows._array.map((row) => row.id);
          // SQL statement for inserting course levels
          const insertStatement = `INSERT INTO Course_Levels (Course_ID, Level_Name, Total_Words, Known_Words) VALUES (?, ?, 0, 0)`;
          // Iterate over each course ID and level to populate the table
          courseIDs.forEach((courseID) => {
            const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            levels.forEach((level) => {
              tx.executeSql(
                insertStatement,
                [courseID, level],
                (_, { rowsAffected }) => {
                  if (rowsAffected > 0) {
                    // console.log(`Inserted course level: Course_ID ${courseID}, Level_Name ${level}`);
                  } else {
                    console.log('Failed to insert course level.');
                  }
                },
                (_, error) => {
                  console.log('Error occurred while inserting course level:', error);
                }
              );
            });
          });
          resolve(); // Resolve the promise when all levels are inserted
        },
        (_, error) => {
          reject(`Error fetching course IDs: ${error.message}`);
        }
      );
    });
  });
};

const insertWord = (tableName, tx, row) => {
  const word = row['Word'];
  const definition = row['Definition'];
  const level = row['Level'];
  tx.executeSql(
    `INSERT INTO ${tableName} (Word, Definition, Level_Name) VALUES (?, ?, ?)`,
    [word, definition, level],
    () => {
      // console.log(`Table '${tableName}' dropped successfully.`);
    },
    (error) => {
      console.error(`Error adding word '${word}':`, error);
    }
  );
};

const insertWords = (tableName, data ) =>{
  const db = SQLite.openDatabase(DATABASE_NAME);
  let wordCount = 0;
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        for (let row of data){
          insertWord(tableName,tx,row);
          wordCount++;
        }
      },
      (error) => {
        reject(error);
      },
      () => {
        resolve();
        // console.log('Words were inserted successfully = ', wordCount);
      }
    );
  });
};

let counts = {};

const getWordCountByLevel = (level, tableName, tx) => {
  return new Promise((resolve, reject) => {
    tx.executeSql(
      `SELECT COUNT(*) AS word_count FROM ${tableName} WHERE Level_Name = ?`,
      [level],
      (_, result) => {
        const { rows } = result;
        const wordCount = rows.item(0).word_count;
        resolve(wordCount);
        // console.log(`for level '${level}' the count is '${wordCount}'`);
      },
      (_, error) => {
        console.log(error);
        reject(error);
      }
    );
  });
};

export const getWordCountByLevels = async(tableName) => {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const db = SQLite.openDatabase(DATABASE_NAME);
  let wordCounts = {};
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        const promises = levels.map((level) =>
          getWordCountByLevel(level, tableName, tx)
            .then((count) => {
              wordCounts[level] = count;
            })
        );

        Promise.all(promises)
          .then(() => {
            resolve(wordCounts);
          })
          .catch((error) => {
            reject(error);
          });
      },
      (error) => {
        console.log(error);
        reject(error);
      }
    );
  });
};

const getCourseId = (courseName) =>{
  const db = SQLite.openDatabase(DATABASE_NAME);
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Get the courseId based on the courseName
        tx.executeSql(
          'SELECT id FROM Courses WHERE Course_Name = ?',
          [courseName],
          (_, result) => {
            const { rows } = result;
            const id = rows.item(0).id;
            resolve(id);
          },
          (_, error) => {
            reject(error);
          }
        );
      },
      (error) => {
        reject(error);
      },
      () => {
        // console.log('CourseId was queried');
      }
    );
  });
};

const updateCourseLevelsRow = (tx, courseID,level, quantity) => {
  tx.executeSql(
    'UPDATE Course_Levels SET Total_Words = ? WHERE Course_ID = ? AND Level_Name = ?',
    [quantity,courseID,level],
    () => {
      // console.log(`Course '${courseID}' and level '${level} was updated to '${quantity}'`);
    },
    (error) => {
      console.error(`Error updating row for level '${level}':`, error);
    }
  );
};

const updateCourseLevels = (courseID) => {
  const db = SQLite.openDatabase(DATABASE_NAME);
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        for (let level in counts){
          quantity = counts[level];
          updateCourseLevelsRow(tx,courseID,level,quantity);
        }
      },
      (error) => {
        reject(error);
      },
      () => {
        resolve();
        // console.log('Course_Levels table was successfully updated');
      }
    );
  });
};

const checkTableStatus = (tableNames) => {
  // This function is only to check that the tables were populated correctly, or at least with some data
  const db = SQLite.openDatabase(DATABASE_NAME);
  const promises = tableNames.map((tableName) => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `SELECT COUNT(*) as count FROM ${tableName}`,
            [],
            (_, result) => {
              const { rows } = result;
              const count = rows.item(0).count;
              const isEmpty = count === 0;
              resolve({ tableName, isEmpty, count });
            },
            (_, error) => {
              reject(error);
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  });
  return Promise.all(promises);
};

const printCourseLevelsTable = () => {
  const db = SQLite.openDatabase(DATABASE_NAME);
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT * FROM Course_Levels',
      [],
      (_, result) => {
        const { rows } = result;
        const rowCount = rows.length;
        for (let i = 0; i < rowCount; i++) {
          const row = rows.item(i);
        }
      },
      (_, error) => {
        console.error('Error printing Course_Levels table:', error);
      }
    );
  });
};

export const createAndPopulateDatabase = () => {
  return new Promise((resolve, reject) => {
    dropTables()
    .then(() => createDatabase())
    .then(() => checkTablesCreated())
    .then(() => clearTables())
    .then(() => populateCoursesTable())
    .then(() => populateCourseLevelsTable())
    .then(() => insertWords("English_Words", dataEnglish))
    .then(() => getWordCountByLevels("English_Words"))
    .then((wordCounts) => { counts = wordCounts})
    .then(() => getCourseId("English"))
    .then((id) => updateCourseLevels(id))
    .then(() => insertWords("Spanish_Words", dataSpanish))
    .then(() => getWordCountByLevels("Spanish_Words"))
    .then((wordCounts) => { counts = wordCounts})
    .then(() => getCourseId("Spanish"))
    .then((id) => updateCourseLevels(id))
    .then(() => checkTableStatus(['Courses','Course_Levels','English_Words','Spanish_Words','Scores']))
    .then((results) => {
      if (results) {
        // console.log("Promise for tables was resolved");
        resolve();
      } else {
        console.log("Promise for tables was rejected");
        reject();
      }
    })
    .catch((error) => console.error(error));
  });
};

export const queryWords = (tableName, rowCount, level, maxRevision) => {
  const db = SQLite.openDatabase(DATABASE_NAME);
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT Word, Definition FROM ${tableName} WHERE Level_Name = ? AND Revisions < ? ORDER BY RANDOM() LIMIT ?`,
        [level, maxRevision, rowCount],
        (_, result) => {
          const { rows } = result;
          const wordList = [];

          for (let i = 0; i < rows.length; i++) {
            const word = rows.item(i);
            wordList.push(word);
          }
          resolve(wordList);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const queryWordsToReview = (tableName, rowCount, level, minRevision, maxRevision) => {
  const db = SQLite.openDatabase(DATABASE_NAME);
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT Word, Definition FROM ${tableName} WHERE Level_Name = ? AND Revisions >= ? AND Revisions <= ? ORDER BY RANDOM() LIMIT ?`,
        [level, minRevision, maxRevision, rowCount],
        (_, result) => {
          const { rows } = result;
          const wordList = [];

          for (let i = 0; i < rows.length; i++) {
            const word = rows.item(i);
            wordList.push(word);
          }
          resolve(wordList);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const insertScore = async (courseName, scoreValue) => {
  try {
    const courseId = await getCourseId(courseName);

    const db = SQLite.openDatabase(DATABASE_NAME);

    let currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() - currentDate.getTimezoneOffset()); // Set timezone offset to 0
    const formattedDate = currentDate.toISOString().slice(0, 19).replace("T", " ");

    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO Scores (Course_ID, Score, Date) VALUES (?, ?, ?)',
          [courseId, scoreValue, formattedDate],
          () => {
            // console.log('Score inserted successfully.');
          },
          (error) => {
            console.error('Error inserting score:', error);
          }
        );
      },
      (error) => {
        console.error('Error starting database transaction:', error);
      }
    );
  } catch (error) {
    console.error('Error inserting score:', error);
  }
};

export const getLast10Scores = (courseName) => {
  const db = SQLite.openDatabase(DATABASE_NAME);
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT Score, Date
           FROM Scores
           WHERE Course_ID = (SELECT id FROM Courses WHERE Course_Name = ?)
           ORDER BY Date DESC
           LIMIT 10`,
          [courseName],
          (_, result) => {
            const { rows } = result;
            const scores = rows._array.map((row) => row.Score).reverse(); // Extract and reverse the scores
            resolve(scores);
          },
          (_, error) => {
            reject(error);
          }
        );
      },
      (error) => {
        reject(error);
      },
      () => {
        // Transaction completed
      }
    );
  });
};

// Function to update the Revisions column for a list of words in a specified table
export const updateRevisionsForWordsInTable = (tableName, wordList) => {
  const db = SQLite.openDatabase(DATABASE_NAME);
  db.transaction(
    (tx) => {
      // Iterate through the word list and update Revisions for each word
      wordList.forEach((word) => {
        tx.executeSql(
          `UPDATE ${tableName} SET Revisions = Revisions + 1 WHERE Word = ?`,
          [word],
          () => {
            // console.log(`Updated Revisions for ${word} in table ${tableName}`);
          },
          (error) => {
            console.error(`Error updating Revisions for ${word} in table ${tableName}:`, error);
          }
        );
      });
    },
    (error) => {
      console.error('Transaction error:', error);
    }
  );
};

export const updateRevisionsBySwitchValue = (tableName, wordsObj) => {
  const db = SQLite.openDatabase(DATABASE_NAME);
  db.transaction(
    (tx) => {
      // Loop through keys in wordsObj
      Object.keys(wordsObj).forEach((word) => {
        // Check if the word's value is true
        if (wordsObj[word]) {
          // Update the Revisions column for this word in the specified table
          tx.executeSql(
            `UPDATE ${tableName} SET Revisions = ? WHERE Word = ?`,
            [4, word],
            () => {
              // console.log(`Updated Revisions for ${word} in ${tableName}`);
            },
            (error) => {
              console.error(`Error updating Revisions for ${word}:`, error);
            }
          );
        }
      });
    },
    (error) => {
      console.error('Transaction error:', error);
    }
  );
};

// This function is just to check that the tables English_Words or Spanish_Words
// were actually updated after using updateRevisionsForWordsInTable
export const getRevisionsForWordsInTable = (tableName, wordList) => {
  const db = SQLite.openDatabase(DATABASE_NAME);
  return new Promise((resolve, reject) => {
    const placeholders = wordList.map(() => '?').join(',');
    const query = `SELECT Word, Revisions FROM ${tableName} WHERE Word IN (${placeholders})`;
    db.transaction(
      (tx) => {
        tx.executeSql(
          query,
          wordList,
          (_, { rows }) => {
            const revisions = {};
            for (let i = 0; i < rows.length; i++) {
              const { Word, Revisions } = rows.item(i);
              revisions[Word] = Revisions;
            }
            resolve(revisions);
          },
          (_, error) => {
            reject(error);
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const countWordsByRevisions = async(tableName, level, maxRevision) => {
  const db = SQLite.openDatabase(DATABASE_NAME);
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT COUNT(*) as count FROM ${tableName} WHERE Level_Name = ? AND Revisions >= ?`,
        [level, maxRevision],
        (_, result) => {
          const { rows } = result;
          const { count } = rows.item(0); // Extract the count from the result
          resolve(count);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const getSortedUniqueDates = () => {
  // Function to get all the unique dates (ignoring the time) of the scores saved in the Scores table
  const db = SQLite.openDatabase(DATABASE_NAME);
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT DISTINCT Date(Date) AS Date FROM Scores ORDER BY Date ASC',
          [],
          (_, result) => {
            const dates = [];
            const { rows } = result;
            for (let i = 0; i < rows.length; i++) {
              dates.push(new Date(rows.item(i).Date));
            }
            resolve(dates);
          },
          (_, error) => {
            reject(error);
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};

const isConsecutive = (date1, date2) => {
  let oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
  // Calculate the difference in days between the two dates
  let daysDifference = Math.abs(Math.floor(
    (Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate()) -
      Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate())) /
      oneDay
  ));
  // Dates are considered consecutive if the difference is exactly 1 day
  return daysDifference === 1;
};

const checkEqualDates = (date1, date2) =>{
  // Extract the day, month, and year components of the two dates
  const year1 = date1.getUTCFullYear();
  const month1 = date1.getUTCMonth();
  const day1 = date1.getUTCDate();

  const year2 = date2.getUTCFullYear();
  const month2 = date2.getUTCMonth();
  const day2 = date2.getUTCDate();

  return day1 == day2 && month1 == month2 && year1 == year2;
};

export const calculateLongestStreak = (dates) => {
  if (dates.length <= 1) {
    // to handle the case where the user is playing for the first time
    return dates.length;
  }
  let longestStreak = 0;
  let currentStreak = 0;
  let currentDate = null;

  for (const date of dates) {
    // Check if there's no previous date or if the current date is consecutive
    if (!currentDate || isConsecutive(currentDate, date)) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
    currentDate = date;
  }
  return longestStreak;
};

export const calculateCurrentStreak = (dates) => {

  if (dates.length == 0) {
    // to handle the case where the user is playing for the first time
    return 0;
  }
  let currentDate = new Date();
  let j = dates.length - 1;
  let previousDate = dates[j];
  let currentStreak = 0;

  if ( checkEqualDates(currentDate, previousDate) ){
    currentStreak = 1;
  } else {
    // check if the dates are not consecutive
    // in that case the user has not played for a whole day
    // and the streak should be zero
    if ( !isConsecutive(currentDate, previousDate) ){
      return 0;
    } else {
      // if the days are consecutive then I can still count the last streak
      // as the current streak.
      currentDate = previousDate;
      currentStreak = 1;
    }
  }
  j--;

  for (let i = j; i >= 0; i--) {
    const date = dates[i];
    if (isConsecutive(currentDate, date)) {
      currentStreak++;
    } else {
      break;
    }
    currentDate = date;
  }
  return currentStreak;
};

// Function to get the total practiced time in minutes
export const getPracticedTime = () => {
  const db = SQLite.openDatabase(DATABASE_NAME);
  // each entry in the Scores table counts as a minute because the'
  // duration of each game session is 1 min.
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT COUNT(*) AS TotalRows FROM Scores',
          [],
          (_, result) => {
            const { rows } = result;
            if (rows.length > 0) {
              const { TotalRows } = rows.item(0);
              resolve(TotalRows);
            } else {
              resolve(0); // No rows found
            }
          },
          (_, error) => {
            reject(error);
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
};
