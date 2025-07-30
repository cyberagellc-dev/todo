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
import { Trash2, Plus } from "lucide-react"

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
}: {
  todo: Todo
  onToggle: (id: number) => void
  onDelete: (id: number) => void
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
      className={`flex items-center gap-2 p-4 rounded-lg border transition-all ${
        todo.completed ? "bg-muted/50 text-muted-foreground" : "bg-background hover:bg-muted/30"
      } ${isDragging ? "opacity-50 shadow-lg scale-105 z-50" : ""}`}
    >
      {/* Large drag handle area */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-12 h-12 -ml-2 -my-2 rounded-lg cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted transition-colors touch-manipulation"
        style={{ touchAction: "none" }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
          </div>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
          </div>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Checkbox with larger touch target */}
      <div className="flex items-center justify-center w-10 h-10 -my-1">
        <Checkbox
          id={`todo-${todo.id}`}
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          className="w-5 h-5"
        />
      </div>

      {/* Task text */}
      <label
        htmlFor={`todo-${todo.id}`}
        className={`flex-1 cursor-pointer py-2 text-base ${todo.completed ? "line-through" : ""}`}
      >
        {todo.text}
      </label>

      {/* Delete button with larger touch target */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(todo.id)}
        className="w-10 h-10 text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation"
      >
        <Trash2 className="h-5 w-5" />
        <span className="sr-only">Delete task</span>
      </Button>
    </div>
  )
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor),
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Todo List</CardTitle>
            {totalCount > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                {completedCount} of {totalCount} tasks completed
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new todo */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a new task..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={addTodo} size="icon">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add task</span>
              </Button>
            </div>

            {/* Add instruction text before the todo list */}
            {todos.length > 1 && (
              <p className="text-xs text-muted-foreground text-center pb-2">Drag the ⋮⋮ handle to reorder tasks</p>
            )}

            {/* Todo list */}
            <div className="space-y-3">
              {todos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No tasks yet. Add one above!</p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
                    {todos.map((todo) => (
                      <SortableItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
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
                className="w-full"
              >
                Clear Completed ({completedCount})
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
