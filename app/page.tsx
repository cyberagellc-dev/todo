"use client"

import type React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Trash2, Plus, ChevronUp, ChevronDown, Menu } from "lucide-react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Todo {
  id: number
  text: string
  completed: boolean
}

function SortableItem({
  todo,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  todo: Todo
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  onMoveUp: (id: number) => void
  onMoveDown: (id: number) => void
  isFirst: boolean
  isLast: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-xl border-2 transition-all duration-200 ${
        todo.completed ? "border-green-200 bg-green-50/50" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      } ${isDragging ? "opacity-60 shadow-lg scale-[1.02] z-50 rotate-1" : ""}`}
    >
      {/* Main content area */}
      <div className="flex items-center gap-4 p-4 min-h-[72px]">
        {/* Drag handle - larger and more prominent */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-12 h-12 rounded-lg cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-all duration-150 touch-manipulation shrink-0"
          style={{ touchAction: "none" }}
          aria-label="Drag to reorder"
        >
          <Menu className="w-6 h-6" />
        </div>

        {/* Checkbox with larger touch area */}
        <div className="flex items-center justify-center w-12 h-12 shrink-0">
          <Checkbox
            id={`todo-${todo.id}`}
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo.id)}
            className="w-6 h-6 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
          />
        </div>

        {/* Task text */}
        <div className="flex-1 min-w-0">
          <label
            htmlFor={`todo-${todo.id}`}
            className={`block cursor-pointer text-base leading-relaxed py-2 ${
              todo.completed ? "line-through text-green-700/70" : "text-gray-900"
            }`}
          >
            {todo.text}
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Move up/down buttons - backup for drag and drop */}
          <div className="hidden sm:flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMoveUp(todo.id)}
              disabled={isFirst}
              className="w-8 h-6 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" />
              <span className="sr-only">Move up</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMoveDown(todo.id)}
              disabled={isLast}
              className="w-8 h-6 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">Move down</span>
            </Button>
          </div>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(todo.id)}
            className="w-12 h-12 text-red-400 hover:text-red-600 hover:bg-red-50 touch-manipulation"
          >
            <Trash2 className="h-5 w-5" />
            <span className="sr-only">Delete task</span>
          </Button>
        </div>
      </div>

      {/* Mobile-only move buttons */}
      <div className="sm:hidden flex justify-center gap-2 px-4 pb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMoveUp(todo.id)}
          disabled={isFirst}
          className="flex-1 h-8 text-xs"
        >
          <ChevronUp className="h-3 w-3 mr-1" />
          Up
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMoveDown(todo.id)}
          disabled={isLast}
          className="flex-1 h-8 text-xs"
        >
          <ChevronDown className="h-3 w-3 mr-1" />
          Down
        </Button>
      </div>
    </div>
  )
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const addTodo = () => {
    if (newTodo.trim() !== "") {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: newTodo.trim(),
          completed: false,
        },
      ])
      setNewTodo("")
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const moveUp = (id: number) => {
    const index = todos.findIndex((todo) => todo.id === id)
    if (index > 0) {
      const newTodos = [...todos]
      ;[newTodos[index - 1], newTodos[index]] = [newTodos[index], newTodos[index - 1]]
      setTodos(newTodos)
    }
  }

  const moveDown = (id: number) => {
    const index = todos.findIndex((todo) => todo.id === id)
    if (index < todos.length - 1) {
      const newTodos = [...todos]
      ;[newTodos[index], newTodos[index + 1]] = [newTodos[index + 1], newTodos[index]]
      setTodos(newTodos)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo()
    }
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-4 sm:py-8">
      <div className="max-w-lg mx-auto">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">My Tasks</CardTitle>
            {totalCount > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>{completedCount} completed</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>{totalCount - completedCount} remaining</span>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Add new todo */}
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="What needs to be done?"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 h-12 text-base px-4 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              />
              <Button onClick={addTodo} className="h-12 w-12 rounded-xl bg-blue-500 hover:bg-blue-600 shrink-0">
                <Plus className="h-5 w-5" />
                <span className="sr-only">Add task</span>
              </Button>
            </div>

            {/* Instructions */}
            {todos.length > 1 && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  <span className="hidden sm:inline">Drag the ☰ handle or use arrow buttons to reorder</span>
                  <span className="sm:hidden">Use the Up/Down buttons to reorder tasks</span>
                </p>
              </div>
            )}

            {/* Todo list */}
            <div className="space-y-3">
              {todos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No tasks yet</p>
                  <p className="text-gray-400 text-sm">Add your first task above to get started</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
                    {todos.map((todo, index) => (
                      <SortableItem
                        key={todo.id}
                        todo={todo}
                        onToggle={toggleTodo}
                        onDelete={deleteTodo}
                        onMoveUp={moveUp}
                        onMoveDown={moveDown}
                        isFirst={index === 0}
                        isLast={index === todos.length - 1}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* Clear completed tasks */}
            {completedCount > 0 && (
              <Button
                variant="outline"
                onClick={() => setTodos(todos.filter((todo) => !todo.completed))}
                className="w-full h-12 text-base border-2 border-green-200 text-green-700 hover:bg-green-50 rounded-xl"
              >
                Clear {completedCount} Completed Task{completedCount !== 1 ? "s" : ""}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
