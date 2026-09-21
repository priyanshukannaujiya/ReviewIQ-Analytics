from pydantic import BaseModel, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)
    company_name: str = Field(..., min_length=2)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in value):
            raise ValueError("Password must contain at least one uppercase character")
        if not any(c.islower() for c in value):
            raise ValueError("Password must contain at least one lowercase character")
        if not any(c.isdigit() for c in value):
            raise ValueError("Password must contain at least one number")
        return value

    @field_validator("confirm_password")
    @classmethod
    def validate_confirm_password(cls, value, info):
        data = info.data
        if "password" in data and value != data["password"]:
            raise ValueError("Passwords do not match")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    company_name: str | None = None
