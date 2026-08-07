REVOKE ALL ON FUNCTION public.shares_chat_thread(uuid, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.shares_chat_thread(uuid, uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.search_chat_contacts(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.search_chat_contacts(text) TO authenticated;