import { Header } from "~/components/Header";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chatbot" },
    { name: "description", content: "Welcome to this chatbot :D" },
  ];
}

export default function Home() {
  return (
  <>
    <Header />
    <div className="p-20 text-4xl">Theeback</div>
  </>
  ) 
}
