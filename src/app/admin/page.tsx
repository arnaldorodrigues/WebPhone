import { redirect } from "next/navigation";

const AdminHome = () => {
  redirect('/admin/dashboard');
}

export default AdminHome;