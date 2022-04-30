
## pizza ordering

```log
AI: What pizza would you like to order?
pepperoni with olives
2022-04-30T09:11:00.304Z [application] info kind -> pepperoni
2022-04-30T09:11:00.305Z [application] info base ->
2022-04-30T09:11:00.306Z [application] info add_ingredient -> olives
AI: Would you like base to be thin or thick?
remove olives
2022-04-30T09:11:07.505Z [application] info kind -> pepperoni
2022-04-30T09:11:07.505Z [application] info base ->
2022-04-30T09:11:07.507Z [application] info add_ingredient ->
AI: Ok.
AI: Would you like base to be thin or thick?
thin
2022-04-30T09:11:33.064Z [application] info kind -> pepperoni
2022-04-30T09:11:33.095Z [application] info base -> thin
2022-04-30T09:11:33.096Z [application] info add_ingredient ->
AI: Ok.
AI: So, pepperoni on a thin base . Is that correct?
change pepperoni to margarita
2022-04-30T09:12:52.109Z [application] info kind -> pepperoni        
2022-04-30T09:12:52.110Z [application] info base -> thin
2022-04-30T09:12:52.122Z [application] info add_ingredient -> 
AI: Ok.
AI: So, pepperoni on a thin base . Is that correct?
change pizza pepperoni to margarita 
AI: Ok.
AI: So, margarita on a thin base . Is that correct?
2022-04-30T09:13:18.336Z [application] info kind -> margarita
2022-04-30T09:13:18.337Z [application] info base -> thin
2022-04-30T09:13:18.337Z [application] info add_ingredient ->
add onion
2022-04-30T09:14:51.192Z [application] info kind -> margarita
2022-04-30T09:14:51.213Z [application] info base -> thin
2022-04-30T09:14:51.214Z [application] info add_ingredient -> onion
AI: Ok.
AI: So, margarita on a thin base onion. Is that correct?
yeah
2022-04-30T09:14:56.442Z [application] info {"slots":{"kind":{"value":"margarita","values":["pepperoni"]},"base":{"value":"thin","values":["thin"]},"add_ingredient":{"value":"onion","values":["olives"]}},"success":true}

```

**Different changes**
```log

AI: Hello, mister Jones!
AI: We have identified you by your phone number.
AI: Would you like to order a margarita as usual? Thin crust, olives?
no
AI: What pizza would you like to order?
pepperoni with olives
2022-04-30T09:55:58.750Z [application] info kind -> pepperoni
2022-04-30T09:55:58.751Z [application] info base ->
2022-04-30T09:55:58.752Z [application] info add_ingredient -> olives
AI: Would you like base to be thin or thick?
thin
2022-04-30T09:56:02.599Z [application] info kind -> pepperoni
2022-04-30T09:56:02.599Z [application] info base -> thin
2022-04-30T09:56:02.600Z [application] info add_ingredient -> olives
AI: So, pepperoni on a thin base, olives. Is that correct?
remove olives
2022-04-30T09:56:08.774Z [application] info kind -> pepperoni
2022-04-30T09:56:08.775Z [application] info base -> thin
2022-04-30T09:56:08.776Z [application] info add_ingredient ->
AI: Ok.
AI: So, pepperoni on a thin base, . Is that correct?
change thin base to thick
2022-04-30T09:56:22.483Z [application] info kind -> pepperoni
2022-04-30T09:56:22.484Z [application] info base -> thick
2022-04-30T09:56:22.513Z [application] info add_ingredient -> 
AI: Ok.
AI: So, pepperoni on a thick base, . Is that correct?
not pepperoni I want margarita
2022-04-30T09:56:41.490Z [application] info kind -> margarita
2022-04-30T09:56:41.491Z [application] info base -> thick
2022-04-30T09:56:41.531Z [application] info add_ingredient -> 
AI: Ok.
AI: So, margarita on a thick base, . Is that correct?
add onion
2022-04-30T09:56:48.738Z [application] info node 'slot_asker'
2022-04-30T09:56:48.739Z [application] info kind -> margarita
2022-04-30T09:56:48.740Z [application] info base -> thick
2022-04-30T09:56:48.741Z [application] info add_ingredient -> onion
AI: So, margarita on a thick base, onion. Is that correct?
I want thin base not thick base
2022-04-30T09:58:08.537Z [application] info kind -> margarita
2022-04-30T09:58:08.537Z [application] info base -> thin
2022-04-30T09:58:08.538Z [application] info add_ingredient -> onion
AI: Ok.
AI: So, margarita on a thin base, onion. Is that correct?
finally, yes
2022-04-30T09:58:15.506Z [application] info {"slots":{"kind":{"value":"margarita","values":["margarita"]},"base":{"value":"thin","values":["thin"]},"add_ingredient":{"value":"onion","values":["olives"]}},"success":true}
AI: Is the address the same as before?
yes
AI: OK, that'll be $25. Now I will send you a text link for payment.
AI: Thank you, the payment was completed.
AI: Bye!
```

**menu in slotfilling**
```log
AI: Hello, mister Jones!
AI: We have identified you by your phone number.
AI: Would you like to order a margarita as usual? Thin crust, olives?
no
AI: What pizza would you like to order?
what have you got in menu
AI: We've got 
AI: pepperoni
AI: margarita
AI: hawaiian
AI:  and 
AI: manhattan
AI: on the menu
AI: What pizza would you like to order?
hawaiian
AI: Would you like base to be thin or thick?
i prefer thin crust
AI: So, hawaiian on a thin base, . Is that correct?
what ingredients do you have
AI: We've got
AI: bacon
AI: cheddar
AI: chicken
AI: onion
AI: pineapple
AI: chilli
AI:  and 
AI: olives
please add extra chicken
AI: So, hawaiian on a thin base, chicken. Is that correct?
yes
2022-04-30T10:07:36.200Z [application] info {"slots":{"kind":{"value":"hawaiian","values":["hawaiian"]},"base":{"value":"thin","values":["thin"]},"add_ingredient":{"value":"chicken","values":["chicken"]}},"success":true}
AI: Is the address the same as before?
yes
AI: OK, that'll be $25. Now I will send you a text link for payment.
AI: Thank you, the payment was completed.
AI: Bye!

```

**ask address**
```log
AI: Hello, mister Jones!
AI: We have identified you by your phone number.
AI: Would you like to order a margarita as usual? Thin crust, olives?
yes 
AI: Is the address the same as before?
no its Centre ave building one three six
AI: OK, that'll be $25. Now I will send you a text link for payment.
AI: Thank you, the payment was completed.
AI: Bye!
2022-04-30T10:12:27.049Z [conv:07e323] info conversation complete
conversation result { userStreet: 'centre ave', userHouseNumt: 'one three six' }
```