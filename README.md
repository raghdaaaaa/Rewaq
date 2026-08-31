## What's done:

- [x] add auth controller (register - login) and their routes.

- [x] add auth middelwares:
    - authenticate.js
    - authorize_admin.js
    - authorize_user.js

- [x] update user's routs to:

    GET    /users

    GET    /users/me

    PATCH  /users/me
    
    DELETE /users/me

    GET    /users/me/books

    GET    /users/:id

    PATCH  /users/:id

    DELETE /users/:id

    DELETE /users

- [x] add book searching based on both title and author.

---

## What's left:

- [ ] fix updating role logic.
- [ ] add "book cover" document and its CRUD.