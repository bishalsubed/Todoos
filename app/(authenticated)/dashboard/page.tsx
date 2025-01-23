"use client"

import { useUser } from '@clerk/nextjs'
import { Todo } from '@prisma/client'
import React, { useCallback, useEffect, useState } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useToast } from '@/hooks/use-toast'
import { AlertTriangle, CheckCheck, CheckCircle, Loader, Trash2, Undo } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


const Dashboard = () => {

    const user = useUser()
    const { toast } = useToast()

    const [todos, setTodos] = useState<Todo[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [title, setTitle] = useState("")
    const [updatedTitle, setUpdatedTitle] = useState("")
    const [loading, setLoading] = useState(true)
    const [totalPage, setTotalPage] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [debouncedSearchTerm] = useDebounceValue(searchTerm, 300)

    const fetchTodos = useCallback(async (page: number) => {
        try {
            setLoading(true)
            const response = await axios.get(`/api/todos?page=${page}&search=${debouncedSearchTerm}`)
            if (response.status !== 200) {
                throw new Error('Error fetching todos')
            }
            const data = response.data
            setTodos(data.todos)
            setTotalPage(data.totalPages)
            setCurrentPage(data.currentPage)
        } catch (err: any) {
            console.error('Error fetching todos', err)
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Problem fetching todos. Please try again.",
            })
        } finally {
            setLoading(false)
        }
    }, [debouncedSearchTerm])

    const fetchSubscriptionStatus = async () => {
        const res = await axios.get("/api/subscription")
        if (res.status === 200) {
            const data = await res.data
            setIsSubscribed(data.isSubscribed)
        }
    }
    useEffect(() => {
        fetchTodos(currentPage)
        fetchSubscriptionStatus()
    }, [fetchTodos, currentPage])


    const handleAddTodo = async (title: string) => {
        toast({
            title: "Adding Todo...",
            description: "Please wait for a moment.",
        })
        if (title.trim()) title.trim()
        else throw new Error("Title cannot be empty")
        try {
            const response = await axios.post('/api/todos', { title })
            console.log(response)
            if (response.status !== 201) {
                throw new Error('Error adding todo')
            }
            await fetchTodos(currentPage)
            toast({
                description: "Your Todo has been Added.",
            })
        } catch (err: any) {
            console.error('Error adding todo', err)
            console.log(err.response.data)
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Problem Adding todo. Please try again.",
            })
        }
    }
    const handleSubmitTodo = (e: React.FormEvent) => {
        e.preventDefault()
        handleAddTodo(title)
        setTitle("");
    }

    const handleUpdateTodo = async (id: string, completed: boolean) => {
        toast({
            title: "Updating Todo...",
            description: "Please wait for a moment.",
        })
        try {
            const response = await axios.put(`/api/todos/${id}`, { completed })
            if (response.status !== 200) {
                throw new Error('Error updating todo')
            }
            await fetchTodos(currentPage)
            toast({
                description: "Your Todo completion status has been Updated.",
            })
        } catch (err: any) {
            console.error('Error updating todo', err)
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Problem updating todo. Please try again.",
            })
        }
    }

    const handleDeleteTodo = async (id: string) => {
        toast({
            title: "Deleting Todo...",
            description: "Please wait for a moment.",
        })
        try {
            const res = await axios.delete(`/api/todos/${id}`)
            if (res.status !== 200) {
                throw new Error('Error deleting todo')
            }
            await fetchTodos(currentPage)
            toast({
                description: "Your Todo has been Deleted.",
            })
        } catch (err: any) {
            console.log("Error deleting todo", err)
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Problem deleting todo. Please try again.",
            })
        }
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>, id: string) => {
        try {
            const updateTodo = todos.map((todo) => {
                if (todo.id === id) {
                    setUpdatedTitle(e.target.value)
                    return { ...todo, title: e.target.value }
                }
                else { return todo };
            }
            )
            setTodos(updateTodo)
        } catch (error) {
            console.log("Error changing title", error)
        }
    }
    const handleUpdatedTitle = async(id:string, title:string) => {
        toast({
            title: "Updating Todo...",
            description: "Please wait for a moment.",
        })
        try {
            const response = await axios.patch(`/api/todos/${id}`, { title })
            if (response.status !== 200) {
                throw new Error('Error updating todo')
            }
            await fetchTodos(currentPage)
            toast({
                description: "Your Todo title has been Updated.",
            })
        } catch (err: any) {
            console.error('Error updating todo', err)
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Problem updating todo. Please try again.",
            })
        }
    }
    return (
        <div className='container mx-auto p-4 max-w-2xl mb-8'>
            <h1 className='text-2xl text-center mb-8 font-semibold'> Welcome, {user.user?.emailAddresses[0].emailAddress}!</h1>
            <Card className=" mb-8">
                <CardHeader>
                    <CardTitle>Create Todo</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmitTodo} className='flex w-full items-center space-x-2'>
                        <Input
                            value={title}
                            className=' h-[40px]'
                            type="text"
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter Todo"
                        />
                        <Button type="submit">Add</Button>
                    </form>
                </CardContent>
            </Card>
            {!isSubscribed && todos.length >= 3 && (
                <Alert variant="destructive" className="mb-8">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        You&apos;ve reached the maximum number of free todos.{" "}
                        <Link href="/subscribe" className="font-medium underline">
                            Subscribe now
                        </Link>{" "}
                        to add more.
                    </AlertDescription>
                </Alert>
            )}
            <Card className=" mb-8">
                <CardHeader>
                    <CardTitle>
                        <div className='flex justify-between items-center'>
                            <span className='underline underline-offset-4'>Your Todos</span>
                            <Input 
                            className='w-[250px]' 
                            type="text" 
                            placeholder="Search..." 
                            onChange={(e)=> {setSearchTerm(e.target.value)}}
                            />
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        {loading ? (
                            <div className='flex justify-center'>
                                <Loader className='size-8 text-black animate-spin' />
                            </div>
                        ) : (
                            todos.length > 0 ? (
                                todos.map((todo) => (
                                    <div key={todo.id} className='flex justify-between mb-2'>
                                        {todo.completed && (<div className='flex text-sm font-medium'><CheckCheck size={25} color='green' /></div>)}
                                        <textarea
                                            className={`resize-none ${todo.completed?"text-center":"text-start" } outline-none text-sm font-semibold w-[280px] focus:border-2 focus:p-1`}
                                            value={todo.title}
                                            onClick={() => setUpdatedTitle(todo.title)}
                                            onChange={(e) => handleTitleChange(e, todo.id)}
                                            onBlur={()=>{handleUpdatedTitle(todo.id, updatedTitle)}}
                                            rows={3}
                                            cols={3}
                                            spellCheck="false"
                                        />

                                        <div className='flex space-x-2'>
                                            <Button onClick={() => handleUpdateTodo(todo.id, !todo.completed)} size={'sm'} variant={'outline'}>
                                                {todo.completed ? (<><Undo size={3} /> Undo</>) : (<><CheckCircle size={3} />
                                                    Mark as Completed </>)}
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        size={'sm'}
                                                        variant={'destructive'}
                                                    >
                                                        <Trash2 size={3} />Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete your TODO
                                                            and remove your data from our servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteTodo(todo.id)}>Continue</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='text-center text-gray-600'>Add Todos to get Started</div>
                            )
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Dashboard