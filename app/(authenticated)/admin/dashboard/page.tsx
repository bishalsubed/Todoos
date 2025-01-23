"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import React, { useCallback, useState } from 'react'
import { AlertTriangle, CheckCheck, Loader, Trash2 } from 'lucide-react'
import axios from 'axios'
import { AlertDialogTrigger, AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogAction, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

type Todo = {
    id: string;
    title: string;
    completed: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
};

type User = {
    id: string;
    email: string;
    isSubscribed: boolean;
    subscriptionEndsAt: Date | null;
    todos: Todo[];
};

const AdminDashboard = () => {
    const { toast } = useToast()

    const [userEmail, setUserEmail] = useState("");
    const [userInfo, setUserInfo] = useState<User | null>(null)
    const [updatedTitle, setUpdatedTitle] = useState("")
    const [loading, setLoading] = useState(false)
    const [totalPage, setTotalPage] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [subscriptionEndsAt, setSubscriptionEndsAt] = useState<string | null>(null)

    const fetchUserInfo = useCallback(async (page: number) => {
        toast({
            variant: "default",
            title: "Fetching UserInfo...",
            description: "Please wait for a moment.",
        })
        try {
            setLoading(true)
            const response = await axios.get(`/api/admin?email=${userEmail}&page=${page}`)
            if (response.status !== 200) {
                throw new Error('Error fetching todos')
            }
            const data = response.data
            setUserInfo(data.user)
            setTotalPage(data.totalPages)
            setCurrentPage(data.currentPage)
            toast({
                variant: "default",
                title: "Success",
                description: "Successfully fetched UserInfo",
            })
        } catch (err: any) {
            console.error('Error fetching todos', err)
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Problem fetching UserInfo. Please try again.",
            })
        } finally {
            setLoading(false)
        }
    }, [userEmail, toast])

    const handleSubmitEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        fetchUserInfo(currentPage)
    }

    const handleCancelSubscription = async (userId: string) => {
        toast({
            variant: "default",
            title: "Canceling Subscription...",
            description: "Please wait for a moment.",
        })
        try {
            const response = await axios.put(`/api/admin?userId=${userId}`)
            if (response.status !== 200) {
                throw new Error('Error cancelling subscription')
            }
            fetchUserInfo(currentPage)
            toast({
                variant: "default",
                title: "Success",
                description: "Successfully cancelled subscription",
            })
        } catch (error) {
            console.error('Error cancelling subscription', error)
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Problem cancelling subscription. Please try again.",
            })
        }
    }
    const handleProvideSubscription = async (userId: string) => {
        toast({
            variant: "default",
            title: "Providing Subscription...",
            description: "Please wait for a moment.",
        })
        try {
            const response = await axios.patch(`/api/admin?userId=${userId}`)
            if (response.status !== 200) {
                throw new Error('Error providing subscription')
            }
            fetchUserInfo(currentPage)
            toast({
                variant: "default",
                title: "Success",
                description: "Successfully provided subscription",
            })
        } catch (error) {
            console.error('Error providing subscription', error)
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Problem providing subscription. Please try again.",
            })
        }
    }

    return (
        <div className='container mx-auto p-4 max-w-2xl mb-8'>
            <h1 className='text-2xl text-center mb-8 font-semibold'>Admin Dashboard</h1>
            <Card className=" mb-8">
                <CardHeader>
                    <CardTitle>User Email</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmitEmail} className='flex w-full items-center space-x-2'>
                        <Input
                            value={userEmail}
                            className='h-[40px]'
                            type="text"
                            onChange={(e) => setUserEmail(e.target.value)}
                            placeholder="Enter Email"
                        />
                        <Button type="submit">Search</Button>
                    </form>
                </CardContent>
            </Card>
            {userInfo && (<div className='flex flex-col'>
                {loading && (<div className='flex justify-center'>
                    <Loader className='size-8 text-black animate-spin' />
                </div>)}
                <Card className='mb-8'>
                    <CardHeader>
                        <CardTitle className='underline underline-offset-4'>Subscription Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {userInfo.isSubscribed ? (<div>
                            <ul className='flex flex-col gap-[6px] mb-4'>
                                <li className='text-sm font-medium'>Email: <span className='font-semibold'>{userInfo.email}</span></li>
                                <li className='text-sm font-medium'>Subscribed Status: <span className='font-semibold'>{userInfo.isSubscribed ? "Yes" : "No"}</span></li>
                                <li className='text-sm font-medium'>Valid Until: <span className='font-semibold'>{new Date(userInfo.subscriptionEndsAt!).toLocaleString()}</span></li>
                            </ul>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        size={'sm'}
                                        variant={'destructive'}
                                    >
                                        Cancel Subsccription
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Sure You Want To Deleted Subscription Of The User?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleCancelSubscription(userInfo.id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>) : (<div className=''>
                            <div className='mb-2'>Email: <span className='font-semibold'>{userInfo.email}</span></div>
                            <div className='flex items-center gap-2 mb-4'>
                                <AlertTriangle className="size-5" />
                                <span className='font-semibold'>User is not a SUBSCRIBED user.</span>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        size={'sm'}
                                        variant={'default'}
                                    >
                                        Provide Subscription
                                    </Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Sure You Want To Provide Subscription To The User?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleProvideSubscription(userInfo.id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                        </div>)}
                    </CardContent>
                </Card>
                <Card className=" mb-8">
                    <CardHeader>
                        <CardTitle className='flex justify-between mb-4 '>
                            <span className='underline underline-offset-4'>User Todos</span>
                            <div>User Id:{userInfo.id}</div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            {loading ? (
                                <div className='flex justify-center'>
                                    <Loader className='size-8 text-black animate-spin' />
                                </div>
                            ) : (
                                userInfo.todos.length > 0 ? (
                                    userInfo.todos.map((todo) => (
                                        <div key={todo.id} className='flex justify-between mb-2'>
                                            {todo.completed && (<div className='flex text-sm font-medium'><CheckCheck size={25} color='green' /></div>)}
                                            <div className={`text-center font-semibold w-full`}>
                                                {todo.title}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className='text-center text-gray-600'>User Doesn't Have Any Todos At The Moment</div>
                                )
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            )
            }
        </div>
    )
}

export default AdminDashboard