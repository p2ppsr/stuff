import React, { useState, useEffect } from 'react'
import { useLocation, useHistory, Link } from 'react-router-dom'
import path from 'path'
import crypto from 'crypto'
import {
  Typography, Divider, List, ListItem, ListItemIcon, ListItemText, TextField, Button, Card, IconButton
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import FolderIcon from '@mui/icons-material/Folder'
import DescriptionIcon from '@mui/icons-material/Description'
import DeleteIcon from '@mui/icons-material/Delete'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import SaveIcon from '@mui/icons-material/Save'
import { toast } from 'react-toastify'

const useStyles = makeStyles(theme => ({
  content: theme.templates.page_wrap,
  top_grid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gridGap: theme.spacing(1),
    alignItems: 'center',
    marginBottom: '1em',
    padding: theme.spacing(2)
  }
}), { name: 'Files' })

/* Specification:

Filesystem nodes are JSON objects. Each has a "type" field.

When "type" is "folder", "nodes" is an array of child nodes, each an object with "type", "name".

When "type" is "file", "contents" is the contents of the file.

Nodes cannot contain "/" in their names.

*/

// Mock Babbage KVStore

const get = async x => {
  return localStorage[x]
}

const set = async (k, v) => {
  localStorage[k] = v
}

const remove = async x => {
  delete localStorage[x]
}

// helpers

// Generates random ID
const getID = () => crypto.randomBytes(16).toString('base64')

// Obtains current file for given path or null if not found
const getFile = async p => {
  if (p === '/') {
    const slash = await get('/')
    if (!slash) return null
    return JSON.parse(slash)
  }
  const parts = p.split('/')
  let cur = '/'
  for (let part = 1; part < parts.length; part++) {
    const node = await get(cur)
    const parsedNode = JSON.parse(node)
    if (parsedNode.type !== 'folder') return null
    const next = parsedNode.nodes.find(x => x.name === parts[part])
    if (!next) return null
    cur = next.id
  }
  const found = JSON.parse(await get(cur))
  found.id = cur
  return found
}

const Files = () => {
  const [displayType, setDisplayType] = useState('folder')
  const [currentFileID, setCurrentFileID] = useState('')
  const [childDirectories, setChildDirectories] = useState([])
  const [fileContents, setFileContents] = useState('')
  const [contentLoading, setContentLoading] = useState(true)
  const [contentSaving, setContentSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const location = useLocation()
  const history = useHistory()
  const classes = useStyles()
  // The filesystem path is after the # symbol
  const currentFilesystemPath = location.pathname

  useEffect(() => {
    (async () => {
      const contents = await getFile(currentFilesystemPath)
      if (!contents) {
        // If we are in /, we need to create the root directory.
        if (currentFilesystemPath === '/') {
          await set(currentFilesystemPath, JSON.stringify({
            type: 'folder',
            nodes: []
          }))
          setCurrentFileID('/')
          setContentLoading(false)
          setNotFound(false)
          return
        }
        // Otherwise, nothing was found.
        setNotFound(true)
        setContentLoading(false)
        return
      }
      setDisplayType(contents.type)
      setCurrentFileID(
        currentFilesystemPath === '/' ? '/' : contents.id
      )
      if (contents.type === 'folder') {
        setChildDirectories(contents.nodes)
      } else if (contents.type === 'file') {
        setFileContents(contents.contents)
      } else {
        console.error('Unknown content type!', contents)
      }
      setContentLoading(false)
      setNotFound(false)
    })()
  }, [currentFilesystemPath])

  const handleNewFolder = async () => {
    const folderName = window.prompt('Folder name')
    const newID = getID()
    const newChildDirectories = [
      ...childDirectories,
      {
        type: 'folder',
        name: folderName,
        id: newID
      }
    ]
    await set(currentFileID, JSON.stringify({
      type: 'folder',
      nodes: newChildDirectories
    }))
    await set(newID, JSON.stringify({
      type: 'folder',
      nodes: []
    }))
    setChildDirectories(newChildDirectories)
  }

  const handleNewFile = async () => {
    const fileName = window.prompt('File name')
    const newID = getID()
    const newChildDirectories = [
        ...childDirectories,
      {
        type: 'file',
        name: fileName,
        id: newID
      }
      ]
    await set(currentFileID, JSON.stringify({
      type: 'folder',
      nodes: newChildDirectories
    }))
    await set(newID, JSON.stringify({
      type: 'file',
      contents: ''
    }))
    setChildDirectories(newChildDirectories)
  }

  const handleDelete = async x => {
    if (!window.confirm(`Delete ${x.name}`)) return
    const indexToDelete = childDirectories.findIndex(i => i.id === x.id)
    const newChildDirectories = [...childDirectories]
    newChildDirectories.splice(indexToDelete, 1)
    await set(currentFileID, JSON.stringify({
      type: 'folder',
      nodes: newChildDirectories
    }))
    await remove(x.id)
    setChildDirectories(newChildDirectories)
  }

  const handleRename = async x => {
    const newName = window.prompt(`New name for ${x.name}`)
    const indexToRename = childDirectories.findIndex(i => i.name === x.name)
    const newChildDirectories = [...childDirectories]
    newChildDirectories[indexToRename].name = newName
    await set(currentFileID, JSON.stringify({
      type: 'folder',
      nodes: newChildDirectories
    }))
    setChildDirectories(newChildDirectories)
  }

  const handleSaveFile = async () => {
    await set(currentFileID, JSON.stringify({
      type: 'file',
      contents: fileContents
    }))
    toast.dark(`Changes to "${currentFilesystemPath.substring(
        currentFilesystemPath.lastIndexOf('/') + 1
      )}" are saved.`)
    history.push(
      currentFilesystemPath.substring(
        0,
        currentFilesystemPath.lastIndexOf('/')
      )
    )
  }

  if (contentLoading) {
    return <div>Loading...</div>
  }
  if (notFound) {
    return <div>File or folder not found! Path: {currentFilesystemPath}</div>
  }
  if (displayType === 'folder') {
    return (
      <div className={classes.content}>
        <Card className={classes.top_grid}>
          <Typography variant='h4'>
            {currentFilesystemPath}
          </Typography>
          <Button
            onClick={handleNewFolder}
            startIcon={<CreateNewFolderIcon />}
            variant='contained'
            size='small'
          >
            New Folder
          </Button>
          <Button
            onClick={handleNewFile}
            startIcon={<NoteAddIcon />}
            variant='contained'
            size='small'
          >
            new file
          </Button>
        </Card>
        <Divider />
        <List>
          {currentFilesystemPath !== '/' && (
            <ListItem
              button
              onClick={() => {
                history.push(currentFilesystemPath.substring(0, currentFilesystemPath.lastIndexOf('/')))
              }}
            >
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText
                primary='..'
              />
            </ListItem>
          )}
          {childDirectories.map((x, i) => (
            <ListItem
              key={i}
              button
              secondaryAction={
                <>
                  <IconButton
                    onClick={e => {
                      e.stopPropagation()
                      handleRename(x)
                    }}
                  >
                    <DriveFileRenameOutlineIcon />
                  </IconButton>
                  <IconButton
                    onClick={e => {
                      e.stopPropagation()
                      handleDelete(x)
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              }
              onClick={() => {
                history.push(path.join(
                  currentFilesystemPath || '',
                  x.name || ''
                ))
              }}
            >
              <ListItemIcon>
                {x.type === 'folder' ? <FolderIcon /> : <DescriptionIcon />}
              </ListItemIcon>
              <ListItemText
                primary={x.name}
              />
            </ListItem>
          ))}
        </List>
      </div>
    )
  }

  if (displayType === 'file') {
    return (
      <div className={classes.content}>
        <Card className={classes.top_grid}>
          <Typography variant='h4'>
            <DescriptionIcon />{' '}{currentFilesystemPath}
          </Typography>
          <Button
            onClick={handleSaveFile}
            startIcon={<SaveIcon />}
            variant='contained'
            size='small'
          >
            Save & Close
          </Button>
        </Card>
        <Divider />
        <TextField
          fullWidth
          multiline
          value={fileContents}
          onChange={e => setFileContents(e.target.value)}
        />
      </div>
    )
  }

  return (
    <div>Unknown content type! {displayType}</div>
  )
}

export default Files