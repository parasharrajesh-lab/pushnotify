# Nock helpdesk

Support book for every release shipped in this console. Use the article that matches the screen the customer is on. Do not invent a charge, a password, or a delivery the Activity log does not show.

Nock is a workspace for a business that sends mobile push and in-app messages. Prices are in rupees. Usage is counted as monthly active devices (MAU). This environment records Stripe and Skydo events. It does not charge a card.

## Release index

| Release | What the customer can do | Where |
|---|---|---|
| 1. Workspace | Register, sign in, pick Free, Basic, or Advance | Register, Plan |
| 2. Team and brand | Invite people, set a role, set the app name and logo | Team, Brand |
| 3. Connect | Save an Android or iOS token, add an SDK or webhook, run a test | Connect, User path analytics |
| 4. System owner | Grant SDK, webhook, and test rights; register an enterprise | System owner sign-in, System |
| 5. Password | Reset a forgotten password without being told the account does not exist | Forgot password |
| 6. Campaign | Build a push or in-app message in five steps | Campaigns |
| 7. Schedule | Set a button, a custom time, and a frequency | Campaigns, What and When |
| 8. Segments | Save an audience from behavior, and pick a goal | Segments, Who |
| 9. Events and image | Narrow by an app or iOS event, and open the image on the deep link | Who, What, phone preview |
| 10. Campaign analytics | Track sent push and in-app separately from tests and unsent campaigns | Analytics |
| 11. System management | B2B users, enterprise onboarding, tokens, plans, invoices, gateways, settings, and the log | System owner |

## How to answer

1. Ask which workspace and which role they are signed in as. A viewer only sees Activity.
2. Read the sentence on the screen. The product states the rule. Repeat that sentence.
3. If the send is blocked, check Plan before Campaigns. A full MAU cap, a failed payment, or an unfinished enterprise accept pauses every send.
4. Never paste a system-owner password into chat or onto a webpage. System owner sign-in is a separate link. The password is not shown in the product.

---

## Release 1. Workspace and plans

### Register

The customer enters a business name, their name, an email, and a password of 8 to 128 characters, then picks Free, Basic, or Advance. Free is usable immediately. There is no card form on this screen.

### Sign in

Email and password, or Google, or X. The same email cannot be both “missing” and “already registered.”

| What they tried | What to say |
|---|---|
| Sign in, email was never registered | No account uses that email. Register a workspace. |
| Sign in, email exists, password is wrong | That password does not match. Use Forgot password to set a new one. |
| Sign in, email was created with Google or X | This email is registered with Google or X. Set a password with Forgot password, or continue with that provider. |
| Register, email already has a password | That email is already registered. The password does not match. Use Forgot password to set a new one. |
| Register or reset, email is the system owner | That email is the system owner. Use System owner sign in. The system owner password is not changed on the business page. |

### Plans

| Plan | Monthly base | Included MAU | After the cap |
|---|---|---|---|
| Free | ₹0 | 500 | No overage. Sends pause. |
| Basic | ₹4,999 | 10,000 | ₹0.80 per extra MAU |
| Advance | ₹24,999 | 100,000 | ₹0.40 per extra MAU |

MAU is the count of active devices this period, shown as `used / cap` in the header. Team invites start on Basic. Video on the lock screen is Advance only.

If the header is at the cap, or billing is marked payment failed, every campaign publish stops. Tell the customer: sends stay paused until the plan has room, or until Stripe or Skydo records a settled payment. Do not take a card number in the ticket.

---

## Release 2. Team, roles, and brand

The owner invites teammates by email and sets one role. Pending invites show until the person signs in with that email.

| Role | Can |
|---|---|
| Owner | Campaigns, segments, devices, activity, plan, team, brand, connect, test |
| Developer | Connect, test, activity, devices (view) |
| Marketer | Campaigns, segments, user path, register a test device, activity |
| Analyst | User path, activity, plan (view) |
| Viewer | Activity only |

If a section is missing from the left nav, the role does not include it. Do not tell them the page is broken.

Brand sets the name and logo used on the phone preview. The logo is the mark on the lock-screen alert. A failed image falls back to the first letter of the app name.

---

## Release 3. User path analytics and Connect

### Path

User path analytics replaces the old device list for a business user. It shows how known people move from opening the app, to being able to receive push, to opening a notification, to returning the next day, to a purchase. Filter by platform or by a step. A business user can still register a test device. They cannot drop a token. That action is not on this screen.

### Tokens

| Platform | Accepted token |
|---|---|
| iOS | Exactly 64 hexadecimal characters (APNs) |
| Android | FCM registration string, 80 to 4,096 characters, letters, numbers, `_`, `:`, `-`, and it must contain a colon |

Anything else is rejected with the sentence on the form. A token save marks that device allowed and active. Dropping a token is not available to the business. Only the system owner can do it, under System settings on the owner panel. The device leaves MAU and is marked denied.

### Grants

SDK, webhook, and test run stay locked until the system owner turns that grant on for the workspace. Connect shows each one as granted or locked.

- SDK and webhook can target Android, iOS, or a website.
- A test run records one sandbox delivery to a connection that is already saved. It is not a live send to every customer.
- A developer can connect and test. They cannot publish a campaign unless they are also a marketer or owner.

---

## Release 4. System owner and enterprise

System owner is a separate sign-in on the same login page. It is a link, not a form that is prefilled, and the password is not printed on the page. If a customer asks for it, refuse. That account is not a business user and its password is not reset from Forgot password.

The system owner can:

- See each workspace, its plan, MAU, and whether it is self-serve or enterprise.
- Turn SDK, webhook, and test grants on or off.
- Drop a token from System settings, or from that enterprise workspace. A business user who asks to remove a device should be sent here.
- Register an enterprise on Basic or Advance. Billing starts only after the workspace accepts. The owner panel is System management: B2B users, enterprise onboarding, the workspace and its device tokens, plan status, invoices, subscription rates, payment gateways, grants, and the system log. Signing secrets are not shown. The log records the action, not the secret.

An enterprise does not send until someone in that workspace accepts onboarding. The accept screen states the monthly base, the included MAU, and the pay-per-use rate. No card is charged there. After accept, the workspace is live and the system owner issues the bill.

Stripe and Skydo webhooks can move a workspace onto a paid plan or mark it past due. Replay is for a recorded event. Support does not type card data into either provider from this console.

---

## Release 5. Password reset

1. On the login page, choose Forgot password and enter the email.
2. If the email is registered to a business user, or was created with Google or X, the product issues a reset code for that browser.
3. Enter the code and a new password twice.
4. Sign in with the new password.

The code is stored only as a hash. It is bound to the normalized email (trimmed, lower case). A missing email is told to register. The system owner is told to use System owner sign-in.

Do not ask the customer to create a second account with the same email.

---

## Release 6. Campaigns

A campaign is five steps: Start, Who, What, When, Publish. The phone on the right is a preview, not a send. Nothing is delivered until Publish, and only if that step has no error.

### Start

| Choice | Meaning |
|---|---|
| Push | Lock screen, through FCM on Android and APNs on iOS |
| In-app | Inside the open app: banner, modal, or a permission primer |
| Past behavior | Send to people who already match |
| Live behavior | Arm the campaign. It sends when the action happens, not on the clock |
| External trigger | Same as live, but the action comes from outside the app |

A permission primer is only for people who have not been asked yet. It needs a button, such as Allow. It cannot include video.

### Who

Audience is everyone, one platform, one tag (Orders, Lapsing, VIP, New), or one saved segment. Estimated reach is shown under the choices. Zero reachable devices blocks publish.

### What

- Title, required, up to 65 characters.
- Message, required, up to 180 characters.
- Deep link and image: see Release 9.
- Button label, up to 24 characters. A primer must have one.
- Button deep link. If it is empty, the button uses the message deep link.
- Video, Advance only, and not on a primer. It must be an `https` link.

### When

See Release 7.

### Publish

The summary lists channel, audience, button, time, frequency, and goal. Publish is disabled while an error is showing. After a successful publish, Activity shows the campaign.

| State | What it means |
|---|---|
| Sent | Past behavior, sent now, outside quiet hours |
| Queued until quiet hours end | Push sent now, but it is between 9pm and 9am IST and quiet hours are on |
| Scheduled | Past behavior at a custom time, or a live/external campaign that starts accepting the action later |
| Waiting for the trigger | Live or external, starting now |

Activity can show delivered, failed, clicked, and goal hits only after a send. Scheduled, queued, and armed campaigns show zeros until they send.

Push stays available for 1 to 72 hours (time to live). An in-app message can wait 0 to 1,200 seconds after its trigger.

---

## Release 7. Button, schedule, and frequency

### Button

The label is editable. The button opens its own deep link when one is entered. Otherwise it opens the message deep link. A button with no deep link at all is rejected: “The button needs a deep link.”

Allowed links are an app scheme (`metrobites://order/4821`) or another non-script URL, up to 500 characters. `javascript:`, `data:`, and `vbscript:` are rejected.

### Custom date and time

Times are India time (IST).

- Now, or a custom time at least 5 minutes ahead and inside the next 90 days.
- A push with quiet hours on cannot be scheduled between 9pm and 9am IST. Pick 9am to 9pm, or turn quiet hours off.
- Quiet hours do not block an in-app message.
- Live and external campaigns do not send just because the clock hits. The custom time is when they start accepting the action.

### Frequency

| Frequency | Cap | Needs an end |
|---|---|---|
| Once | Always 1 | No |
| Per session | 1 to 10, in-app only | Optional stop time |
| Daily | 1 to 5 | Yes |
| Weekly | 1 to 10 | Yes |

The end must be after the start, and the whole window is at most 90 days. A daily or weekly campaign without an end is rejected.

---

## Release 8. Segments and goals

Segments is available to anyone who can send. A segment is a saved set of rules. A person must match every rule.

### Rules

Use 1 to 4 rules. Each behavior once. Name is 2 to 40 characters and unique in the workspace, ignoring case. A workspace can hold 20 segments.

| Behavior | How it matches |
|---|---|
| Notification opens | At least or at most N, last 7 days |
| Notification dismissals | At least or at most N, last 7 days |
| Sessions | At least or at most N, last 7 days |
| Purchases | At least or at most N, last 30 days |
| Days since last open | At least or at most N days, up to 365. Never opened does not match a number. |
| Returned the next day | Yes or no |
| Permission | Allowed, provisional, ephemeral, denied, or not asked |

The editor shows how many known devices match before you save. Two starter segments are created for a new workspace: Opened this week, and Away for a week. Edit them in place, or create another. Saving the same name updates that segment. A second segment with the same name is rejected.

### Who can receive

| Message | Who is eligible |
|---|---|
| Push | Allowed, provisional, or ephemeral. Denied and not-asked are skipped. |
| In-app banner or modal | Anyone in the segment, including denied |
| Permission primer | Only not asked |

Reach on a segment is scaled from the known devices up to the workspace MAU. It never shows a reach when nobody known matches. A deleted or unknown segment cannot be published: “That segment is not on this workspace.”

### Goal

On Publish the customer picks one goal: opened the notification, returned the next day, started a session, or purchased. After a send, Activity shows how many of the delivered messages are projected to hit that goal. The number cannot be higher than delivered. Denied users are not counted as an open. A scheduled campaign says the goal is counted after it sends.

---

## Release 9. Behavior attributes and the deep-link image

This release adds two controls on the campaign, on top of the segment.

### Attributes on Who

Under the audience, the customer can select up to four attributes. Every selected attribute must be true, and they are combined with the segment or tag already chosen.

App events, named the way analytics records them:

| Attribute | A person matches when |
|---|---|
| `session_start` | At least one session |
| `first_open` | At least one session, and they opened the app today |
| `screen_view` | At least one session, and the app has been opened |
| `notification_receive` | Permission can accept a push (allowed, provisional, or ephemeral) |
| `notification_open` | At least one notification open |
| `notification_dismiss` | At least one dismiss |
| `purchase` | At least one purchase in 30 days |

iOS notification permission, one only:

| Attribute | Permission |
|---|---|
| `authorized` | Allowed |
| `provisional` | Provisional |
| `ephemeral` | Ephemeral |
| `denied` | Denied |
| `notDetermined` | Not asked |

Selecting two permissions is rejected: “A device has one notification permission. Pick only one.” A fifth attribute is rejected: “Use up to 4 behavior attributes.”

Example an agent can walk through: segment Opened this week, plus `purchase` and `authorized`. Reach drops to the people who opened, bought, and allowed notifications. Adding `denied` makes the reach zero, because nobody is both allowed and denied.

`notDetermined` is the attribute that lines up with a permission primer. `authorized` plus a primer matches nobody, because a primer is only for people who have not been asked.

### Image on the deep link

The image is part of the Deep link section, not a separate decoration.

1. Enter the deep link, for example `metrobites://order/4821`.
2. Add an `https` image, upload a PNG, JPEG, WEBP, or GIF under 120 KB, or choose Use sample image.
3. The note under the URL names the screen, here `order/4821`.
4. On the phone preview, tap the message. The device opens that screen and shows the image. Back returns to the alert.
5. The lock screen still shows a small copy of the image. The full image is the opened screen.

Rules:

- An image with an empty deep link cannot be published. Say: “Add a deep link so the image opens on a screen.”
- Image links must be `https`. A script URL is rejected.
- The button opens its own link. That screen does not show the campaign image unless it is the same path as the message deep link.
- A button-only screen says “This screen has no image.”

---

## Release 10. Campaign analytics

Analytics is on the same right as Activity. Viewers, analysts, marketers, developers, and owners can open it. It is not a second send log. Activity remains the list of each campaign. Analytics is the totals.

| Counted | Not counted |
|---|---|
| Sent push | Scheduled, queued, or armed campaigns |
| Sent in-app: banner, modal, primer | Test runs |

Push and in-app have their own delivered, failed, and clicked totals. The click rate is clicks divided by delivered, not by targeted. The delivery rate is delivered divided by targeted. A goal hit cannot be higher than delivered. If nothing was targeted, every rate is 0%.

A campaign saved without a channel is treated as push. In-app layouts are split into banner, modal, and permission primer. The waiting line shows how many are scheduled, queued for quiet hours, or waiting for a trigger. Those rows say none were delivered.

---

## Tickets

### “Publish is disabled”

Read the red sentence. Usual causes, in order:

1. Title or message empty, or over the character limit.
2. No reachable devices for that audience, channel, and attributes.
3. Image set without a deep link, or a button set without any link.
4. Custom time inside the next 5 minutes, inside quiet hours, or more than 90 days out.
5. Daily or weekly campaign with no end, or an end before the start.
6. Video on Free or Basic.
7. Plan cap full, payment past due, or enterprise not accepted yet.

### “The same email cannot sign in but cannot register”

This was a defect and it is fixed. Sign-in and registration now share one account state. Use the table in Release 1. If the password is wrong, send them to Forgot password. Do not tell them to register again.

### “Reach looks smaller than my MAU”

That is expected. A tag, a segment, a primer, and behavior attributes each remove people. Push also skips denied and not-asked devices. The number is an estimate from the known devices, scaled to the workspace, and it will not exceed the audience you started from.

### “I tapped the phone and nothing sent”

The phone is a preview. Only Publish writes a campaign, and Activity is the record. A test run on Connect writes one sandbox row to that connection, not a customer blast.

### “Where is the system owner password?”

It is not in the product and it is not in this book. Point the customer at System owner sign-in only if they are that operator. Do not reset it from the business Forgot password page.

## What this console does not do

- It does not charge a card. Stripe and Skydo are recorded webhooks.
- It does not run an A/B test with two message variants. The goal is a projection on one message.
- It does not deliver to a token that fails the Android or iOS format check.
- It does not show a campaign image on a screen that is not the message deep link.
