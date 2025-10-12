export default async function ServerUserList() {
  // Simulate data fetching
  const users = await new Promise<{ id: number; name: string }[]>((resolve) => {
    setTimeout(
      () =>
        resolve([
          { id: 1, name: "Alex Johnson" },
          { id: 2, name: "Taylor Swift" },
          { id: 3, name: "Jordan Smith" },
        ]),
      2000
    );
  });

  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold ">Server-Rendered User List</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user.id}
            className="p-2 rounded-lg shadow-sm hover:shadow transition-shadow border border-border"
          >
            <span className="font-medium">{user.name}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm ">
        This list is fully rendered on the server with no client-side
        JavaScript.
      </p>
    </section>
  );
}
