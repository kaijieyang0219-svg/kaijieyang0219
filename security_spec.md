# Security Specification for Diet Studio Firebase Connection

## 1. Data Invariants
- Admin (`kaijieyang0219@gmail.com`) has full root-lvl read/write access.
- Non-admin users can create their own initial profile only if `role` is set to `'pending'` (except the predefined bootstrap email `kaijieyang0219@gmail.com` which can be set to `'admin'`).
- Users can update their personal bio/preferences (height, weight, calorie targets) on `/users/{userId}` but are strictly forbidden from self-elevating their `role` or altering `teacherId` / `caregiverId`.
- Access to meals on `/users/{userId}/meals/{mealId}` is strictly restricted to the owner of the account, their assigned `teacherId`, their assigned `caregiverId`, or an `admin`.
- Timestamp fields must align with `request.time`.

## 2. The "Dirty Dozen" Malicious Payloads (Permission Denied TDD cases)
1. **Self-Promote to Admin**: Standard user trying to write `{ "role": "admin" }` to their user document.
2. **Read Private Log of Unlinked User**: Standard user trying to query or trace `/users/someOtherUser/meals/meal-123`.
3. **Change Trainer ID**: Student trying to change their assigned `teacherId` to self-assign a different trainer.
4. **Spoof Admin Mail**: User registering with custom claim or body email set to `kaijieyang0219@gmail.com` but signed in with a different actual provider auth email.
5. **Inject Malformed Large Payload on ID**: Creating a meal with a doc ID of 500KB size.
6. **Set Future / Past CreatedTime**: Modifying a meal record and setting `createdAt` to a custom timestamp instead of `request.time`.
7. **Write Advice as Student**: Student self-updating the `advice` field of their meal records under the guise of their dietitian.
8. **Delete User Document**: Non-admin user attempting to delete their `/users/{userId}` profile doc.
9. **Assign a Student to Coach by Coach self**: A Coach trying to link a student to themselves directly by updating the student's `teacherId`.
10. **Query All Meals globally**: Client attempting a blanket list query on all meals without filtering.
11. **Overwrite Immutable Field**: Student updating `createdAt` or `email` field after initial creation.
12. **Create User without email verification**: Signing up and writing to Firestore without verified email where applicable.

## 3. Test Runner Design / Code Reference
See `firestore.rules` for rule implementation. Tests verifies that all 12 cases return permission denied.
