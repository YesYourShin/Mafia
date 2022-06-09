# FAFIA(BACKEND)

## 目次
1. [槪要](#1-槪要)
2. [担当したこと](#2-担当したこと)  
    2.1. [勝敗結果出力](#21-勝敗結果出力)  
    2.2. [勝ち負け回数出力](#22-勝ち負け回数出力)  
    2.3. [顔の座標情報をルームメンバーと共有](#23-顔の座標情報をルームメンバーと共有)
---
## 1. 槪要
学校のチームプロジェクトで作ったウェブマフィアゲームのBACKEND。　　

---
## 2. 担当したこと

---
### 2.1. 勝敗結果出力  
* src/modules/game/game.controller.ts  
![image](https://user-images.githubusercontent.com/53047744/172741209-f7ecf559-b7f0-4e36-8d90-b5dade6cae7b.png)  
nickname、 page、 item(perpage)をGET  
受けたデータをServiceに送り、ユーザの勝敗結果の詳細情報をResponse

* src/modules/game/game.service.ts  
![image](https://user-images.githubusercontent.com/53047744/172741046-de2d7ba6-945b-480d-8306-b291d3465f45.png)  
勝敗結果の詳細情報を検索するために、ユーザーのnicknameが存在するかを確認  
repositoryのfindOneにnicknameを送る  
nicknameがない場合、Error Messageをthrow  
nicknameがある場合、ユーザーのuserId、page、itemをrepositoryに送り、ユーザの勝敗結果の詳細情報をReturn

* src/modules/game/game.repository.ts  
![image](https://user-images.githubusercontent.com/53047744/172740782-8a31bb1f-4374-4084-acbb-4f32c43096f0.png)  
ユーザーのnicknameを検索する  
nicknameがなければ、falseをReturn  
nicknameがあれば、userIdをReturn  
![image](https://user-images.githubusercontent.com/53047744/172740750-940fe97b-0c2f-4fec-b6d4-d76da8f6d2d9.png)  
ユーザーの勝敗結果の詳細情報を出力するquery作成  
そのユーザーのすべての勝敗結果の詳細情報をReturn 

---
### 2.2. 勝ち負け回数出力  
* src/modules/game/game.controller.ts  
![image](https://user-images.githubusercontent.com/53047744/172741237-a9cfeed8-2501-4e94-97d0-9f16d957bcd3.png)  
userIdをGet  
serviceのgetScoreにuserIdを送り、勝ち負け回数をReturn  

* src/modules/game/game.service.ts  
![image](https://user-images.githubusercontent.com/53047744/172741111-f1e74ffe-fa9a-491c-8ade-490f43efe883.png)  
serviceのgetScoreにuserIdを送り、勝ち負け回数をReturn 

* src/modules/game/game.repository.ts  
![image](https://user-images.githubusercontent.com/53047744/172741155-d6614ad2-a6e6-466b-95a6-46381b0977fe.png)  
勝ち負け回数を出力するquery作成
勝ち負け回数をreturn

---
### 2.3. 顔の座標情報をルームメンバーと共有 
* src/modules/gateway/game/game.gateway.ts   
![image](https://user-images.githubusercontent.com/53047744/172750460-79af5760-6913-4c11-973d-b6aac0d79b95.png)  
dataを受信し、ルームメンバーに送信  
valueがなければ、送信できないので、if文使用

---
