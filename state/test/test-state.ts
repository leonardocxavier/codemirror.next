const ist = require("ist")
import {EditorState, Change, EditorSelection, SelectionRange, MetaSlot} from "../src"

describe("EditorState", () => {
  it("holds doc and selection properties", () => {
    let state = EditorState.create({doc: "hello"})
    ist(state.doc.text, "hello")
    ist(state.selection.primary.from, 0)
  })

  it("can apply changes", () => {
    let state = EditorState.create({doc: "hello"})
    let transaction = state.transaction.change(new Change(2, 4, "w")).change(new Change(4, 4, "!"))
    ist(transaction.doc.text, "hewo!")
    ist(transaction.apply().doc.text, "hewo!")
  })

  it("maps selection through changes", () => {
    let state = EditorState.create({doc: "abcdefgh",
                                    selection: EditorSelection.create([0, 4, 8].map(n => new SelectionRange(n)))})
    let newState = state.transaction.replaceSelection("Q").apply()
    ist(newState.doc.text, "QabcdQefghQ")
    ist(newState.selection.ranges.map(r => r.from).join("/"), "1/6/11")
  })

  const someMeta = new MetaSlot<number>("something")

  it("can store meta properties on transactions", () => {
    let tr = EditorState.create({doc: "foo"}).transaction.setMeta(someMeta, 55)
    ist(tr.getMeta(someMeta), 55)
  })
  
  it("throws when a change's bounds are invalid", () => {
    let state = EditorState.create({doc: "1234"})
    ist.throws(() => state.transaction.replace(-1, 1, ""))
    ist.throws(() => state.transaction.replace(2, 1, ""))
    ist.throws(() => state.transaction.replace(2, 10, "x"))
  })

  it("stores and updates tab size", () => {
    let deflt = EditorState.create({}), two = EditorState.create({tabSize: 2})
    ist(deflt.tabSize, 4)
    ist(two.tabSize, 2)
    let updated = deflt.transaction.setMeta(MetaSlot.changeTabSize, 8).apply()
    ist(updated.tabSize, 8)
  })

  it("stores and updates the line separator", () => {
    let deflt = EditorState.create({}), crlf = EditorState.create({lineSeparator: "\r\n"})
    ist(deflt.lineSeparator, "\n")
    ist(deflt.strictLineSeparator, false)
    ist(crlf.lineSeparator, "\r\n")
    ist(crlf.strictLineSeparator, true)
    let updated = crlf.transaction.setMeta(MetaSlot.changeLineSeparator, "\n").apply()
    ist(updated.lineSeparator, "\n")
  })
})
