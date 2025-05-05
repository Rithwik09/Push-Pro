import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Nav,
  Tab
} from "react-bootstrap";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../shared/firebase/firebaseapi";
import { basePath } from "../../next.config";

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/404/");
  }, []);
  return null;
};

export default Home;
