package model

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"strings"
	"time"

	"github.com/jzyds/dingo/app/utils"
	"github.com/russross/meddler"
)

const stmtGetFileByID = `SELECT * FROM files WHERE id = ?`
const stmtNumberOfFileItem = "SELECT count(*) FROM files"
const stmtGetFileItem = `SELECT * FROM files ORDER BY %s LIMIT ? OFFSET ?`
const stmtDeleteFileByID = `DELETE FROM files WHERE id = ?`
const stmtGetFileOffsetLimit = `SELECT * FROM files WHERE is_show_on_gallery = ? LIMIT ?, ?`

// FileDbItem are a slice of "FileDB"s
type FileDbItem []*FileDb

// A FileDb defines comment item data.
type FileDb struct {
	ID              int64      `meddler:"id,pk"`
	Name            string     `meddler:"name"`
	URL             string     `meddler:"url"`
	CreatedAt       *time.Time `meddler:"created_at"`
	IsShowOnGallery bool       `meddler:"is_show_on_gallery"`
}

// A File is a file, along with a URL and last modified time.
type File struct {
	os.FileInfo
	Url     string
	ModTime *time.Time
}

// NewFileDb returns a new FileDb, with the CreatedAt field set to the
// current time.
func NewFileDb() *FileDb {
	return &FileDb{
		CreatedAt: utils.Now(),
	}
}

// Save saves the comment in the DB.
func (f *FileDb) Save() error {
	err := meddler.Save(db, "files", f)
	return err
}

// CheckSafe checks if the directory is a child directory of base, to make sure
// that GetFileList won't read any folder other than the upload folder.
func CheckSafe(directory string, base string) bool {
	directory = path.Clean(directory)
	dirs := strings.Split(directory, "/")
	return dirs[0] == base
}

// GetNumberOfFileDbItem  gets the total number of files in the DB.
func GetNumberOfFileDbItem() (int64, error) {
	var count int64
	var row *sql.Row
	row = db.QueryRow(stmtNumberOfFileItem)
	err := row.Scan(&count)

	if err != nil {
		return 0, err
	}
	return count, nil
}

func GetGalleryList(offset, limit int) (FileDbItem, error) {
	var files FileDbItem
	err := meddler.QueryAll(db, &files, stmtGetFileOffsetLimit, 1, offset, limit)
	return files, err
}

func (fileItem *FileDbItem) GetFileDbItem(page, size int64, orderBy string) (*utils.Pager, error) {
	var pager *utils.Pager
	count, err := GetNumberOfFileDbItem()
	pager = utils.NewPager(page, size, count)

	if !pager.IsValid {
		return pager, fmt.Errorf("Page not found")
	}

	err = meddler.QueryAll(db, fileItem, fmt.Sprintf(stmtGetFileItem, orderBy), size, pager.Begin)
	return pager, err
}

// GetFileList returns a slice of all Files in the given directory.
func GetFileList(directory string) []*File {
	files := make([]*File, 0)
	fileInfoList, _ := ioutil.ReadDir(directory)
	for i := len(fileInfoList) - 1; i >= 0; i-- {
		if fileInfoList[i].Name() == ".DS_Store" {
			continue
		}
		file := new(File)
		file.FileInfo = fileInfoList[i]
		file.Url = path.Join(directory, fileInfoList[i].Name())
		t := fileInfoList[i].ModTime()
		file.ModTime = &t
		files = append(files, file)
	}
	return files
}

func (f *FileDb) GetFileByID() error {
	err := meddler.QueryRow(db, f, stmtGetFileByID, f.ID)
	return err
}

// DeleteFileByID deletes the given file id from the DB.
func DeleteFileByID(id int64) error {
	writeDB, err := db.Begin()
	if err != nil {
		writeDB.Rollback()
		return err
	}
	_, err = writeDB.Exec(stmtDeleteFileByID, id)
	if err != nil {
		writeDB.Rollback()
		return err
	}
	err = writeDB.Commit()
	if err != nil {
		return err
	}
	return nil
}

// CreateFilePath creates a filepath from the given directory and name,
// returning the name of the newly created filepath.
func CreateFilePath(dir string, name string) string {
	os.MkdirAll(dir, os.ModePerm)
	return path.Join(dir, name)
}
