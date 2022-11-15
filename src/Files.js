import React, { useState, useEffect } from 'react'
import { useLocation, useHistory, Link } from 'react-router-dom'
import path from 'path'
import crypto from 'crypto'

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
    console.log('parsedNode', parsedNode)
    if (parsedNode.type !== 'folder') return null
    const next = parsedNode.nodes.find(x => x.name === parts[part])
    console.log('next', next)
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
  // The filesystem path is after the # symbol
  const currentFilesystemPath = location.pathname

  useEffect(() => {
    (async () => {
      console.log('ping', currentFilesystemPath)
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
    history.push(currentFilesystemPath.substring(0, currentFilesystemPath.lastIndexOf('/')))
  }

  if (contentLoading) {
    return <div>Loading...</div>
  }
  if (notFound) {
    return <div>File or folder not found! Path: {currentFilesystemPath}</div>
  }
  if (displayType === 'folder') {
    return (
      <div>
        <h1>{currentFilesystemPath}</h1>
        <button onClick={handleNewFolder}>new folder</button>
        <button onClick={handleNewFile}>new file</button>
        <ul>
          {currentFilesystemPath !== '/' && (
            <li><Link to={currentFilesystemPath.substring(0, currentFilesystemPath.lastIndexOf('/'))}>..</Link></li>
          )}
          {childDirectories.map((x, i) => (
            <li key={i}>
              <Link to={path.join(currentFilesystemPath, x.name)}>[{x.type}] {x.name}</Link>
              <button onClick={() => handleRename(x)}>[rename]</button>
              <button onClick={() => handleDelete(x)}>[delete]</button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (displayType === 'file') {
    return (
      <div>
        <h1>{currentFilesystemPath}</h1>
        <button onClick={handleSaveFile}>save</button>
        <textarea value={fileContents} onChange={e => setFileContents(e.target.value)} />
      </div>
    )
  }

  return (
    <div>Unknown content type! {displayType}</div>
  )
}

export default Files