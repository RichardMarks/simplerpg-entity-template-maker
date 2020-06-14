const qs = selector => document.querySelector(selector)

const buildElementReferenceTable = tableMap => {
  const refTable = {}
  Object.keys(tableMap).forEach(refName => {
    const elementId = tableMap[refName]
    refTable[refName] = elementId.startsWith('.')
      ? qs(elementId)
      : qs(`#${elementId}`)
  })
  return refTable
}

const ListBoxController = {
  createCheckedItem (item, isChecked) {
    return {
      text: String(item),
      checked: !!isChecked
    }
  },
  create (listBoxElement, initialItems) {
    if (!(listBoxElement instanceof HTMLElement)) {
      throw new Error('HTMLElement was expected')
    }

    const isCheckedListBox = listBoxElement.classList.contains('list-box--with-checkbox')

    const state = {
      selectedIndex: -1,
      items: initialItems ? [ ...initialItems ] : []
    }

    const listeners = {}

    const selectItem = index => {
      state.selectedIndex = index
      if (listeners.select) {
        listeners.select.forEach(listener => {
          listener(state.selectedIndex, state.selectedIndex !== -1)
        })
      }
    }

    const checkItem = (index, isChecked) => {
      if (index >= 0 && index < state.items.length) {
        state.items[index].checked = isChecked
        if (listeners.checked) {
          listeners.checked.forEach(listener => {
            listener(index, isChecked)
          })
        }
      }
    }

    const clearListBoxElements = () => {
      while (listBoxElement.lastChild) {
        listBoxElement.removeChild(listBoxElement.lastChild)
        listBoxElement.lastChild = null
      }
    }

    const updateUI = () => {
      clearListBoxElements()

      state.items.forEach((item, index) => {
        const isSelected = index === state.selectedIndex

        const listBoxItemElement = document.createElement('div')
        listBoxItemElement.id = `${listBoxElement.id}_item${index}`
        listBoxItemElement.classList.add('list-box-item')
        isSelected && listBoxItemElement.classList.add('list-box-item--selected')

        if (isCheckedListBox) {
          const listBoxItemCheckElement = document.createElement('input')
          const listBoxItemTextElement = document.createElement('label')
          listBoxItemCheckElement.id = `${listBoxElement.id}_item${index}_check`
          listBoxItemTextElement.id = `${listBoxElement.id}_item${index}_text`
          listBoxItemCheckElement.type = 'checkbox'
          listBoxItemCheckElement.classList.add('list-box-item_checkbox')
          listBoxItemTextElement.classList.add('list-box-item_text')
          listBoxItemTextElement.innerText = item.text
          listBoxItemCheckElement.checked = item.checked
          listBoxItemCheckElement.addEventListener('change', () => {
            checkItem(index, listBoxItemCheckElement.checked)
          }, false)
          listBoxItemElement.appendChild(listBoxItemCheckElement)
          listBoxItemElement.appendChild(listBoxItemTextElement)
        } else {
          listBoxItemElement.innerText = item
        }

        listBoxItemElement.addEventListener('click', () => {
          for (let i = 0; i < state.items.length; i += 1) {
            if (i !== index) {
              const child = listBoxElement.children[i]
              if (child) {
                child.classList.remove('list-box-item--selected')
              }
            }
          }
          listBoxItemElement.classList.toggle('list-box-item--selected')
          if (state.selectedIndex === index) {
            selectItem(-1)
          } else {
            selectItem(index)
          }
        }, false)
        listBoxElement.appendChild(listBoxItemElement)
      })
    }

    const controller = {
      get type () {
        return isCheckedListBox ? 'checked' : 'standard'
      },

      get length () {
        return state.items.length
      },

      get selectedIndex () {
        return state.selectedIndex
      },

      get items () {
        return state.items.slice()
      },

      clear () {
        clearListBoxElements()
        state.items = []
      },

      on (event, listener) {
        if (typeof listener !== 'function') {
          throw new Error('Expected a Function')
        }
        if (event in listeners) {
          listeners[event].push(listener)
        } else {
          listeners[event] = [listener]
        }
      },

      add (item) {
        state.items.push(item)
        updateUI()
      },

      remove (index) {
        if (index >= 0 && index < state.items.length) {
          state.items.splice(index, 1)
          selectItem(-1)
          updateUI()
        }
      }
    }

    updateUI()

    return controller
  }
}

const boot = () => {
  const state = {
    alias: '',
    baseClass: '',
    maxHealth: 0,
    maxMana: 0,
    vitality: 0,
    magicalAttack: 0,
    strength: 0,
    physicalDefense: 0,
    physicalAttack: 0,
    magicalDefense: 0,
    experienceRewarded: 0,
    moneyRewarded: 0,
    baseLevel: 1,
    skills: [],
    items: [],
    dirty: false
  }

  const ui = buildElementReferenceTable({
    osModalOverlay: 'OS_MODAL_OVERLAY',
    osInputBoxWindow: 'OS_INPUT_BOX_WINDOW',
    osInputBoxTitle: 'OS_INPUT_BOX_TITLE',
    osInputBoxCloseButton: 'OS_INPUT_BOX_CLOSE_BUTTON',
    osInputBoxText: 'OS_INPUT_BOX_TEXT',
    osInputBoxOKButton: 'OS_INPUT_BOX_OK_BUTTON',
    osInputBoxCancelButton: 'OS_INPUT_BOX_CANCEL_BUTTON',
    osInputBoxInput: 'OS_INPUT_BOX_INPUT',

    osMsgBoxWindow: 'OS_MSG_BOX_WINDOW',
    osMsgBoxTitle: 'OS_MSG_BOX_TITLE',
    osMsgBoxCloseButton: 'OS_MSG_BOX_CLOSE_BUTTON',
    osMsgBoxText: 'OS_MSG_BOX_TEXT',
    osMsgBoxOKButton: 'OS_MSG_BOX_OK_BUTTON',

    mainWindow: '.main-window',

    fileMenuHook: 'mnuFileHk',
    helpMenuHook: 'mnuHelpHk',

    fileMenu: 'mnuFile',
    fileNewMenu: 'mnuFileNew',
    fileSaveMenu: 'mnuFileSave',
    helpMenu: 'mnuHelp',
    helpAboutMenu: 'mnuHelpAbout',

    aliasInput: 'strAlias',
    classInput: 'strClass',

    maxHealth: 'strMaxHP',
    maxMana: 'strMaxMP',
    vitality: 'strVIT',
    magicalAttack: 'strMAA',
    strength: 'strSTR',
    physicalDefense: 'strPHD',
    physicalAttack: 'strPHA',
    magicalDefense: 'strMAD',

    baseLevel: 'strBaseLevel',
    experienceRewarded: 'strExp',
    moneyRewarded: 'strMoney',

    skills: 'lstSkills',
    items: 'lstItems',

    addSkillButton: 'btnAddSkill',
    removeSkillButton: 'btnRemoveSkill',
    skillsHelpButton: 'btnSkillsHelp',

    addItemButton: 'btnAddItem',
    removeItemButton: 'btnRemoveItem',
    itemsHelpButton: 'btnItemsHelp'
  })

  // console.log({ ...ui })

  const skillsListBoxController = ListBoxController.create(ui.skills)
  const itemsListBoxController = ListBoxController.create(ui.items)

  window.app = {
    controllers: {
      skillsListBoxController,
      itemsListBoxController
    },
    ui,
    state
  }

  const openMsgBox = (msg, style, title) => {
    ui.osModalOverlay.style.display = 'block'
    ui.osMsgBoxWindow.style.display = 'block'
    ui.mainWindow.classList.toggle('window--inactive')
    ui.osMsgBoxText.innerText = String(msg).slice(0, 1024)
    ui.osMsgBoxTitle.innerText = String(title) || ''

    return new Promise((resolve, reject) => {
      const closeMsgBox = () => {
        ui.osModalOverlay.style.display = 'none'
        ui.osMsgBoxWindow.style.display = 'none'
        ui.mainWindow.classList.toggle('window--inactive')
        ui.osMsgBoxOKButton.removeEventListener('click', handleOK, false)
        ui.osMsgBoxCloseButton.removeEventListener('click', handleClose, false)
      }

      const handleOK = () => {
        closeMsgBox()
        return resolve(true)
      }

      const handleClose = () => {
        closeMsgBox()
        return resolve(null)
      }

      ui.osMsgBoxOKButton.addEventListener('click', handleOK, false)
      ui.osMsgBoxCloseButton.addEventListener('click', handleClose, false)
    })
  }

  const openInputBox = (prompt, title, defaultValue) => {
    ui.osModalOverlay.style.display = 'block'
    ui.osInputBoxWindow.style.display = 'block'
    ui.mainWindow.classList.toggle('window--inactive')
    ui.osInputBoxText.innerText = String(prompt).slice(0, 1024)
    ui.osInputBoxTitle.innerText = String(title) || ''
    ui.osInputBoxInput.value = String(defaultValue) || ''

    return new Promise((resolve, reject) => {
      const closeInputBox = () => {
        ui.osModalOverlay.style.display = 'none'
        ui.osInputBoxWindow.style.display = 'none'
        ui.mainWindow.classList.toggle('window--inactive')
        ui.osInputBoxCancelButton.removeEventListener('click', handleCancel, false)
        ui.osInputBoxOKButton.removeEventListener('click', handleOK, false)
        ui.osInputBoxCloseButton.removeEventListener('click', handleClose, false)
      }

      const handleOK = () => {
        const value = String(ui.osInputBoxInput.value)
        ui.osInputBoxInput.value = ''
        closeInputBox()
        return resolve(value)
      }

      const handleCancel = () => {
        closeInputBox()
        return resolve(null)
      }

      const handleClose = () => {
        closeInputBox()
        return resolve(null)
      }

      ui.osInputBoxCancelButton.addEventListener('click', handleCancel, false)
      ui.osInputBoxOKButton.addEventListener('click', handleOK, false)
      ui.osInputBoxCloseButton.addEventListener('click', handleClose, false)
    })
  }

  const clamp = (value, low, high) => {
    if (value < low) {
      return low
    } else if (value > high) {
      value = high
    } else {
      return value
    }
  }

  const setState = (key, value) => {
    state[key] = value
    state.dirty = true
    return value
  }

  const stateUpdate = (key, isNumeric = true) => ({ low, high, value }) => (typeof isNumeric === 'boolean' && !!isNumeric)
    ? setState(key, clamp(value, low, high))
    : setState(key, value)

  const makeNumericInput = (el, value, { low = 1, high = 9999 }, handleChange) => {
    el.type = 'number'
    el.value = value
    el.min = low
    el.max = high
    el.addEventListener('change', () => {
      el.value = handleChange({ low, high, value: el.value })
    }, false)
  }

  const makeTextInput = (el, value, { maxChars = -1 }, handleChange) => {
    el.type = 'text'
    el.value = value
    el.maxLength = maxChars >= 0 ? maxChars : 524288
    el.addEventListener('change', e => {
      el.value = handleChange({ value: el.value })
    }, false)
  }

  const downloadBlob = ({ filename, dataFmt, mimeType }) => {
    const hasBlobSupport = typeof window.Blob === 'function'
    const hasURLSupport = window.URL && typeof window.URL.createObjectURL === 'function'
    const hasSupport = hasBlobSupport && hasURLSupport

    if (filename && dataFmt && mimeType && hasSupport) {
      const blob = new window.Blob([dataFmt], { type: mimeType })
      const href = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')

      anchor.download = filename
      anchor.href = href
      anchor.dataset.downloadurl = `${mimeType}:${filename}:${href}`
      anchor.dispatchEvent(new window.MouseEvent('click', {
        bubbles: true,
        cancelable: false,
        view: window
      }))
    } else {
      window.alert('Well, this really sucks. You are not able to save from this device :(')
    }
  }

  const saveFile = (filename, content) => {
    const dataFmt = `${content}`
    downloadBlob({ filename, dataFmt, mimeType: 'text/plain' })
  }

  const handleFileNew = () => {
    if (state.dirty) {
      const message = [
        'You have unsaved changes.',
        'Since I have not implemented Yes/No/Cancel buttons,',
        'You cannot create a new entity without saving first.'
      ].join('\n')
      openMsgBox(message, 0, 'Just thought you should know...')
      ui.fileMenu.checked = false
      return
    }
    // update state
    state.alias = ''
    state.baseClass = ''
    state.maxHealth = 0
    state.maxMana = 0
    state.vitality = 0
    state.magicalAttack = 0
    state.magicalDefense = 0
    state.strength = 0
    state.physicalAttack = 0
    state.physicalDefense = 0
    state.baseLevel = 1
    state.experienceRewarded = 0
    state.moneyRewarded = 0
    state.items = []
    state.skills = []

    itemsListBoxController.clear()
    skillsListBoxController.clear()

    // update UI
    ui.removeSkillButton.disabled = true
    ui.removeItemButton.disabled = true
    ui.aliasInput.value = state.alias
    ui.classInput.value = state.baseClass
    ui.maxHealth.value = state.maxHealth
    ui.maxMana.value = state.maxMana
    ui.vitality.value = state.vitality
    ui.magicalAttack.value = state.magicalAttack
    ui.magicalDefense.value = state.magicalDefense
    ui.strength.value = state.strength
    ui.physicalAttack.value = state.physicalAttack
    ui.physicalDefense.value = state.physicalDefense
    ui.baseLevel.value = state.baseLevel
    ui.experienceRewarded.value = state.experienceRewarded
    ui.moneyRewarded.value = state.moneyRewarded

    ui.fileMenu.checked = false
  }

  const handleFileSave = () => {
    if (state.alias.length < 1 || state.baseClass.length < 1) {
      const message = [
        'You cannot really use an entity without specifying the alias and',
        'the base class. Make sure that you have set the alias and the',
        'base class before you try to save your entity.'
      ].join('\n')
      openMsgBox(message, 0, 'Just thought you should know...')
      ui.fileMenu.checked = false
      return
    }
    const equipment = state.items.filter(item => item.checked)

    const content = [
      'FILENAME:\tentity-template.txt\n',
      'DESCRIPTION:\tSimpleRPG ENTITY Definition File for ',
      state.alias, '\n',
      `ALIAS\t\t${state.alias}\n`,
      `CLASS\t\t${state.baseClass}\n`,
      `LEVEL\t\t${state.baseLevel}\n`,
      `MAXHP\t\t${state.maxHealth}\n`,
      `MAXMP\t\t${state.maxMana}\n`,
      `STRENGTH\t${state.strength}\n`,
      `VITALITY\t${state.vitality}\n`,
      `PHYATK\t\t${state.physicalAttack}\n`,
      `PHYDEF\t\t${state.physicalDefense}\n`,
      `MAGATK\t\t${state.magicalAttack}\n`,
      `MAGDEF\t\t${state.magicalDefense}\n`,
      `MONEY\t\t${state.moneyRewarded}\n`,
      `EXPERIENCE\t${state.experienceRewarded}\n`,
      `ABILITIES\t${state.skills.length}\n`,
      ...state.skills.map(skill => `\t\t${skill}\n`),
      `ITEMS\t\t${state.items.length}\n`,
      ...state.items.map(item => `\t\t${item.text}\n`),
      `EQUIP\t\t${equipment.length}\n`,
      ...equipment.map(item => `\t\t${item.text}\n`),
      'END-OF-FILE\n'
    ]

    saveFile('entity-template.txt', content.join(''))

    ui.fileMenu.checked = false
    state.dirty = false
  }

  const handleHelpAbout = () => {
    ui.helpMenu.checked = false
    const message = [
      'SimpleRPG Entity Template Maker',
      'version 6.14.2020',
      'Designed and developed by Richard Marks',
      '(c) 2007 - 2020, Richard Marks'
    ].join('\n')
    openMsgBox(message, 0, 'About')
  }

  const handleItemsHelpButton = () => {
    const message = [
      'Click Add to add an Item. Click Del to delete an Item.',
      'Check the box next to an item in the list to define it as equipment.',
      'Any items checked will be added to the EQUIP list in the template.'
    ].join('\n')
    openMsgBox(message, 0, 'Just thought you should know...')
  }

  const handleSkillsHelpButton = () => {
    openMsgBox('Click Add to add a skill. Click Del to delete a skill.', 0, 'Just thought you should know...')
  }

  const handleAddItemButton = async () => {
    const itemName = await openInputBox('Item Name:', 'Add Item', 'Bandage')
    if (itemName && itemName.trim().length) {
      const item = ListBoxController.createCheckedItem(itemName, false)
      itemsListBoxController.add(item)
      state.items = itemsListBoxController.items
    }
  }

  const handleRemoveItemButton = () => {
    if (itemsListBoxController.selectedIndex >= 0) {
      itemsListBoxController.remove(itemsListBoxController.selectedIndex)
      state.items = itemsListBoxController.items
      ui.removeItemButton.disabled = itemsListBoxController.selectedIndex === -1 || state.items.length === 0
    }
  }

  const handleAddSkillButton = async () => {
    const skill = await openInputBox('Skill Name:', 'Add Skill', 'Attack')
    if (skill && skill.trim().length) {
      skillsListBoxController.add(skill)
      state.skills = skillsListBoxController.items
    }
  }

  const handleRemoveSkillButton = () => {
    if (skillsListBoxController.selectedIndex >= 0) {
      skillsListBoxController.remove(skillsListBoxController.selectedIndex)
      state.skills = skillsListBoxController.items
      ui.removeSkillButton.disabled = skillsListBoxController.selectedIndex === -1 || state.skills.length === 0
    }
  }

  const handleAppLoad = () => {
    makeTextInput(ui.aliasInput, state.alias, { maxChars: -1 }, stateUpdate('alias', {}))
    makeTextInput(ui.classInput, state.baseClass, { maxChars: -1 }, stateUpdate('baseClass', {}))
    makeNumericInput(ui.maxHealth, state.maxHealth, { low: 1, high: 9999 }, stateUpdate('maxHealth'))
    makeNumericInput(ui.maxMana, state.maxMana, { low: 1, high: 9999 }, stateUpdate('maxMana'))
    makeNumericInput(ui.vitality, state.vitality, { low: 1, high: 255 }, stateUpdate('vitality'))
    makeNumericInput(ui.strength, state.strength, { low: 1, high: 255 }, stateUpdate('strength'))
    makeNumericInput(ui.magicalAttack, state.magicalAttack, { low: 1, high: 255 }, stateUpdate('magicalAttack'))
    makeNumericInput(ui.magicalDefense, state.magicalDefense, { low: 1, high: 255 }, stateUpdate('magicalDefense'))
    makeNumericInput(ui.physicalAttack, state.physicalAttack, { low: 1, high: 255 }, stateUpdate('physicalAttack'))
    makeNumericInput(ui.physicalDefense, state.physicalDefense, { low: 1, high: 255 }, stateUpdate('physicalDefense'))
    makeNumericInput(ui.baseLevel, state.baseLevel, { low: 1, high: 99 }, stateUpdate('baseLevel'))
    makeNumericInput(ui.experienceRewarded, state.experienceRewarded, { low: 1, high: 65535 }, stateUpdate('experienceRewarded'))
    makeNumericInput(ui.moneyRewarded, state.moneyRewarded, { low: 1, high: 65535 }, stateUpdate('moneyRewarded'))

    ui.osModalOverlay.style.display = 'none'
    ui.osInputBoxWindow.style.display = 'none'
    ui.osMsgBoxWindow.style.display = 'none'
    ui.mainWindow.classList.toggle('window--inactive')
    ui.removeSkillButton.disabled = true
    ui.removeItemButton.disabled = true

    skillsListBoxController.on('select', (selectedIndex, isSelected) => {
      ui.removeSkillButton.disabled = !isSelected
    })

    itemsListBoxController.on('select', (selectedIndex, isSelected) => {
      ui.removeItemButton.disabled = !isSelected
    })

    itemsListBoxController.on('checked', (itemIndex, isChecked) => {
      if (itemIndex >= 0 && itemIndex < state.items.length) {
        state.items[itemIndex].checked = isChecked
      }
    })

    ui.addSkillButton.addEventListener('click', handleAddSkillButton, false)
    ui.removeSkillButton.addEventListener('click', handleRemoveSkillButton, false)
    ui.skillsHelpButton.addEventListener('click', handleSkillsHelpButton, false)
    ui.addItemButton.addEventListener('click', handleAddItemButton, false)
    ui.removeItemButton.addEventListener('click', handleRemoveItemButton, false)
    ui.itemsHelpButton.addEventListener('click', handleItemsHelpButton, false)
    ui.fileNewMenu.addEventListener('click', handleFileNew, false)
    ui.fileSaveMenu.addEventListener('click', handleFileSave, false)
    ui.helpAboutMenu.addEventListener('click', handleHelpAbout, false)

    ui.fileMenuHook.addEventListener('click', () => {
      ui.helpMenu.checked = false
    }, false)

    ui.helpMenuHook.addEventListener('click', () => {
      ui.fileMenu.checked = false
    }, false)
  }

  handleAppLoad()
}

document.addEventListener('DOMContentLoaded', boot, false)
