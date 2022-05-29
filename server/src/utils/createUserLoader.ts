import DataLoader from "dataloader";
import { User } from "./../entities/User";
import { In } from "typeorm";

export const createUserLoader = () => new DataLoader<number, User>(async userIds => {    
    const users = await User.findBy({
        id: In(userIds as number[])
    })

    const newUsers: User[] = [];
    userIds.map(id => {
        users.forEach(user => {
            if (id === user.id) {
                let tempUser = user;
                newUsers.push(tempUser)
            }
        })
    })    
    
    return newUsers;
});