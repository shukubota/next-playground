import {HooksDemo} from "../../components/hooksDemo";

const PerformanceDemo = () => {
  return (
    <div>
      <h1>Performance Demo</h1>
      <HooksDemo />
    </div>
  )
}

export async function getServerSideProps() {
  const res = await fetch('https://api.github.com/repos/vercel/next.js');
  const repo = await res.json();
  return {
    props: {
      repo: {
        name: repo.name,
        description: repo.description,
      }
    }
  }
}

export default PerformanceDemo;
