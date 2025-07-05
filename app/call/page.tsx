import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Call from "./Call";

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  console.log(data);
  if (error || !data?.user) {
    redirect('/login')
  }

  return <Call userInfo={data}/>
}