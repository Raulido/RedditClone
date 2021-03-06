import { withUrqlClient } from "next-urql"
import { NavBar } from "../components/navBar"
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
  const [{data}] = usePostsQuery();
  return (
    <>
      <NavBar />
      <div> Hello World.</div>
      {!data ? null : data.posts.map((p) => <div key={p.id}>{p.title}</div>)}
    </>
  );  
};

export default withUrqlClient(createUrqlClient, {ssr: true }) (Index);
