import { Label } from "@radix-ui/react-label";
import { data, Form, redirect } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

import { commitSession, getSession } from "~/sessions.server";
import { ConexionApi } from "~/services/conexionApi";
import type { User } from "~/interfaces/user";
import type { Route } from "./+types/login";

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "description", content: "Welcome dashboard" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("userId")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/");
  }

  return data(
    {
      error: session.get("error"),
      responseErrors: session.get("responseErrors"),
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const form = await request.formData();

  const email = form.get("email");
  const password = form.get("password");

  try {
    const response = await ConexionApi.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    if (response.status !== 200) {
      throw new Error("Login failed");
    }

    const { data } = response;

    session.set("userId", data.user.id);
    session.set("user", data.user);
    session.set("token", data.token);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error: any) {
    return data(
      {
        error: error?.response?.data?.message || "Login failed",
        responseErrors: error?.response?.data?.errors,
      },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
        status: 400,
        statusText: "Bad Request",
      }
    );
  }
}

export default function Login({ loaderData }: Route.ComponentProps) {
  const { error } = loaderData;
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <Form
                className="p-6 md:p-8"
                method="POST">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-balance text-muted-foreground">
                      Login to your Acme Inc account
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="m@example.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-2 hover:underline">
                        Forgot your password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full">
                    Login
                  </Button>
                </div>
              </Form>
              <div className="relative hidden bg-muted md:block"></div>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
