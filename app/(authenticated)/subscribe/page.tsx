"use client"
import React, { useCallback, useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { CheckCheck, CheckCircle, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LockKeyholeOpen } from 'lucide-react';;
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Alert, AlertDescription } from '@/components/ui/alert'



const Subscribe = () => {
    const user = useUser()
    const { toast } = useToast();
    const router = useRouter()
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [subscriptionEndsAt, setSubscriptionEndsAt] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchSubscriptionStatus = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await axios.get("/api/subscription");
            if (response.status != 200) {
                throw new Error("Error fetching subscription status")
            }
            setIsSubscribed(response.data.isSubscribed)
            setSubscriptionEndsAt(response.data.subscriptionEndsAt)
        } catch (error) {
            console.log("Error fetching subscription status", error)
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your subscription.",
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchSubscriptionStatus()
    }, [fetchSubscriptionStatus])

    const handleSubscription = async () => {
        try {
            const response = await axios.post("/api/subscription", {});
            if (response.status != 200) {
                throw new Error("Error creating subscription")
            }
            setSubscriptionEndsAt(response.data.subscriptionEndsAt)
            toast({
                title: "Subscription created successfully",
                description: "Your subscription has been created.",
            })
            router.refresh();
        } catch (error: any) {
            console.log("Error creating subscription", error)
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your subscription.",
            })
        }
    }
    return (
        <div className='max-w-md min-h-[78vh] flex justify-center items-center mx-auto'>
            {!isSubscribed ? (<Card>
                <CardHeader>
                    <CardTitle className='underline underline-offset-4'>Access To Premium Services</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div>
                        <ul className='flex flex-col gap-[6px]'>
                            <li className='flex gap-4 text-sm font-medium'><CheckCheck size={18} color='green' /> Access to all premium features</li>
                            <li className='flex gap-4 text-sm font-medium'><CheckCheck size={18} color='green' />  Unlimited Todos</li>
                            <li className='flex gap-4 text-sm font-medium'><CheckCheck size={18} color='green' />  Priority Support</li>
                            <li className='flex gap-4 text-sm font-medium'><CheckCheck size={18} color='green' /> Advanced Task Management  </li>
                            <li className='flex gap-4 text-sm font-medium'><CheckCheck size={18} color='green' /> Productivity Insights  </li>
                            <li className='flex gap-4 text-sm font-medium'><CheckCheck size={18} color='green' /> Offline and Sync Features  </li>
                        </ul>
                    </div>
                    <div>All This Just At <span className='font-semibold mt-3'>3.99$/month</span></div>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => { handleSubscription() }}><LockKeyholeOpen /> Subscribe Now</Button>
                </CardFooter>
            </Card>) : (
                <div className='flex flex-col'>
                    <Alert>
                        <AlertDescription className='flex items-center gap-2'>
                            <CheckCircle className="h-4 w-4" />
                            <span className='font-semibold'>You are a subscribed user.</span>
                        </AlertDescription>
                    </Alert>
                    <Card>
                        <CardHeader>
                            <CardTitle className='underline underline-offset-4'>Your Subscription Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className='flex flex-col gap-[6px]'>
                                <li className='text-sm font-medium'>Email: <span className='font-semibold'>{user.user?.emailAddresses[0].emailAddress}</span></li>
                                <li className='text-sm font-medium'>Subscribed Status: <span className='font-semibold'>{isSubscribed ? "Yes" : "No"}</span></li>
                                <li className='text-sm font-medium'>Valid Until: <span className='font-semibold'>{new Date(subscriptionEndsAt!).toLocaleString()}</span></li>
                            </ul>
                        </CardContent>
                        <CardFooter className='flex flex-col gap-[6px]'>
                            <div className='text-sm text-gray-600'>If you have any type of recommendations or problems including subscription don't forget to contact at example@exam.com</div>
                            <Button onClick={()=>{router.back()}} className='ml-72' variant={'default'}><ChevronLeft size={3}/>Back</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default Subscribe;