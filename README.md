
# corebos-jitsu-destination
---

This is a JITSU destination for corebos. It allows you to send your corebos-jitsu data to a corebos instance.
With the following configurations you can use this destination to send your corebos-jitsu data to a corebos instance.

---
# Developers
Using
Set config.json:
```
cp config.json.example config.json
nano config.json

```

Install all dependencies for a project
```
yarn install
```
Build destination:
```
yarn build

```

Run tests
```
yarn test
```
---

If everything is ok - resulted destination file location
```
./dist/corebos-jitsu-destination.js
```
---
validate config: 

```
yarn validate-config --config-object '
{
  "url": "https://corebos_instance_url",
  "event_types": "registration,error,comment",
  "username": "user",
  "access_key": "access_key",
  "instance_name": "corebos",
  "faq_id": "FAQ ID",
  "comment": "A sample comment of event type: ${event_type}"
}'

```

