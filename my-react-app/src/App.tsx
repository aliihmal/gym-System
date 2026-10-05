import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/home";
import CreateUser from "./pages/createUser";
import GetUser from "./pages/getUser";
import MemberList from "./pages/MemberList";
import RenewMembership from "./pages/RenewMembership";
import ExpiredMembers from "./pages/ExpiredMembers";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/users/new" element={<CreateUser />} />
        <Route path="/users/find" element={<GetUser />} />
        <Route path="/members" element={<MemberList />} />
        <Route path="/members/renew" element={<RenewMembership />} />
        <Route path="/members/expired" element={<ExpiredMembers />} />
      </Route>
    </Routes>
  );
}