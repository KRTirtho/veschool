import { Body, Controller, Logger, Post, Get, Param, Put, Inject } from "@nestjs/common";
import { ApiBearerAuth, ApiNotFoundResponse } from "@nestjs/swagger";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { INVITATION_OR_JOIN_TYPE } from "../database/entity/invitations_or_joins.entity";
import User, { USER_ROLE } from "../database/entity/users.entity";
import { CurrentUser } from "../decorator/current-user.decorator";
import { Roles } from "../decorator/roles.decorator";
import { VerifySchool } from "../decorator/verify-school.decorator";
import { InvitationJoinService } from "../invitation-join/invitation-join.service";
import AddCoAdminDTO from "./dto/add-co-admin.dto";
import CreateSchoolDTO from "./dto/create-school.dto";
import { SchoolService } from "./school.service";

@Controller("school")
@ApiBearerAuth()
export class SchoolController {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private logger: Logger,
        private readonly schoolService: SchoolService,
        private readonly invitationJoinService: InvitationJoinService,
    ) {
        this.logger.setContext(SchoolController.name);
    }

    @Get(":school")
    @ApiNotFoundResponse({ description: "passed {school} doesn't exist" })
    async getSchool(@Param("school") short_name: string) {
        try {
            const school = await this.schoolService
                .queryBuilder("school")
                .where("school.short_name=:short_name", { short_name })
                .leftJoinAndSelect("school.admin", "admin")
                .leftJoinAndSelect("school.coAdmin1", "coAdmin1")
                .leftJoinAndSelect("school.coAdmin2", "coAdmin2")
                .getOneOrFail();
            return school;
        } catch (error: any) {
            this.logger.error(error?.message ?? "");
            throw error;
        }
    }

    @Get(":school/join-requests")
    @VerifySchool()
    @Roles(USER_ROLE.admin, USER_ROLE.coAdmin)
    async getSchoolJoinRequests(@CurrentUser() user: User, @Param("school") _?: number) {
        try {
            return this.invitationJoinService.getSchoolInvitationJoin({
                _id: user.school!._id,
                type: INVITATION_OR_JOIN_TYPE.join,
            });
        } catch (error: any) {
            this.logger.error(error?.message ?? "");
            throw error;
        }
    }

    @Get(":school/invitations")
    @VerifySchool()
    @Roles(USER_ROLE.admin, USER_ROLE.coAdmin)
    async getSchoolSentInvitations(
        @CurrentUser() user: User,
        @Param("school") _?: number,
    ) {
        try {
            return this.invitationJoinService.getSchoolInvitationJoin({
                _id: user.school!._id,
                type: INVITATION_OR_JOIN_TYPE.invitation,
            });
        } catch (error: any) {
            this.logger.error(error?.message ?? "");
            throw error;
        }
    }

    @Post()
    async createSchool(@CurrentUser() user: User, @Body() body: CreateSchoolDTO) {
        try {
            const school = await this.schoolService.createSchool({
                admin: user,
                ...body,
            });
            return school;
        } catch (error: any) {
            this.logger.error(error?.message ?? "");
            throw error;
        }
    }

    @Put(":school/co-admin")
    @VerifySchool()
    @Roles(USER_ROLE.admin)
    async addCoAdmin(
        @Body() body: AddCoAdminDTO,
        @CurrentUser() user: User,
        @Param("school") _?: number,
    ) {
        try {
            return this.schoolService.assignCoAdmin({ ...body, user });
        } catch (error: any) {
            this.logger.log(error?.message ?? "");
            throw error;
        }
    }
}
