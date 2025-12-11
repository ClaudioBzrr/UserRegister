export function isAuthenticated(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}') as Pick<IUser, 'id' | 'name' | 'email'>;
    if (!user || !user.id) {
        return false;
    } else {
        return true
    }
}