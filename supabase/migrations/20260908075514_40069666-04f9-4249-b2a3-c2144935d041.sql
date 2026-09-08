GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;

CREATE POLICY "super_admin_manage_roles_insert" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin() AND user_id <> auth.uid());

CREATE POLICY "super_admin_manage_roles_delete" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.is_super_admin() AND user_id <> auth.uid());

CREATE POLICY "super_admin_read_roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.is_super_admin());